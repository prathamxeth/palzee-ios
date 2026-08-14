import Foundation
import AVFoundation
import UIKit
import React

@objc(VideoExporter)
class VideoExporter: NSObject {
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(exportPortraitVideoWithCaption:caption:timestamp:resolver:rejecter:)
  func exportPortraitVideoWithCaption(_ inputPath: String, caption: String, timestamp: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    var cleanPath = inputPath.replacingOccurrences(of: "file://", with: "")
    if let decoded = cleanPath.removingPercentEncoding {
      cleanPath = decoded
    }
    
    let inputURL = URL(fileURLWithPath: cleanPath)
    let asset = AVAsset(url: inputURL)
    
    guard let videoTrack = asset.tracks(withMediaType: .video).first else {
      reject("ERR_NO_VIDEO", "No video track found at path: \(cleanPath)", nil)
      return
    }
    
    let composition = AVMutableComposition()
    guard let compositionVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
      reject("ERR_TRACK", "Failed to create track", nil)
      return
    }
    
    do {
      try compositionVideoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: videoTrack, at: .zero)
      
      if let audioTrack = asset.tracks(withMediaType: .audio).first,
         let compositionAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
        try? compositionAudioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: audioTrack, at: .zero)
      }
    } catch {
      reject("ERR_INSERT", error.localizedDescription, error)
      return
    }
    
    // 9:16 Full Screen Canvas (1080x1920px)
    let renderSize = CGSize(width: 1080, height: 1920)
    
    // Centered 16:9 Card Container Box (1080x607.5px, Y=656.25px)
    let boxWidth: CGFloat = 1080.0
    let boxHeight: CGFloat = 607.5 // (1080 * 9 / 16)
    let boxYOffset: CGFloat = (1920.0 - boxHeight) / 2.0 // 656.25px (Centered vertically)

    let videoComposition = AVMutableVideoComposition()
    videoComposition.renderSize = renderSize
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30)
    
    let instruction = AVMutableVideoCompositionInstruction()
    instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
    
    let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionVideoTrack)
    
    let transform = videoTrack.preferredTransform
    let naturalSize = videoTrack.naturalSize
    let transformedRect = CGRect(origin: .zero, size: naturalSize).applying(transform)
    let orientWidth = max(abs(transformedRect.width), 1)
    let orientHeight = max(abs(transformedRect.height), 1)
    
    let isVerticalPal = orientHeight > orientWidth
    
    var finalTransform = transform
    
    if isVerticalPal {
      // Rotate 270 degrees counter-clockwise matching VlogSheet.tsx rotate: '270deg' logic
      let rot270 = CGAffineTransform(rotationAngle: 3.0 * .pi / 2.0)
      finalTransform = finalTransform.concatenating(rot270)
      
      let rotBounds = CGRect(origin: .zero, size: naturalSize).applying(finalTransform)
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: -rotBounds.origin.x, y: -rotBounds.origin.y))
      
      let rotW = max(rotBounds.width, 1)
      let rotH = max(rotBounds.height, 1)
      
      // Calculate scale based on rotated dimensions (rotW & rotH) to fill centered 16:9 card box (1080x607.5)
      let scaleX = boxWidth / rotW
      let scaleY = boxHeight / rotH
      let scale = max(scaleX, scaleY)
      finalTransform = finalTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
      
      let fitW = rotW * scale
      let fitH = rotH * scale
      let offX = (boxWidth - fitW) / 2.0
      let offY = (boxHeight - fitH) / 2.0 + boxYOffset
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offX, y: offY))
    } else {
      if transformedRect.origin.x < 0 {
        finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: orientWidth, y: 0))
      }
      if transformedRect.origin.y < 0 {
        finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: 0, y: orientHeight))
      }
      let scaleX = boxWidth / orientWidth
      let scaleY = boxHeight / orientHeight
      let scale = max(scaleX, scaleY)
      finalTransform = finalTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
      let fitW = orientWidth * scale
      let fitH = orientHeight * scale
      let offX = (boxWidth - fitW) / 2.0
      let offY = (boxHeight - fitH) / 2.0 + boxYOffset
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offX, y: offY))
    }
    
    layerInstruction.setTransform(finalTransform, at: .zero)
    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]
    
    // Parent CALayer (1080x1920 Portrait Canvas with Solid Black Letterbox Margins)
    let parentLayer = CALayer()
    parentLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.backgroundColor = UIColor.black.cgColor
    
    let videoLayer = CALayer()
    videoLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.addSublayer(videoLayer)
    
    // Midpoint Y of centered 16:9 card container box (boxYOffset = 656.25, boxHeight = 607.5)
    let overlayCenterY: CGFloat = boxYOffset + (boxHeight - 80.0) / 2.0
    
    // Native Apple System CTFont bindings
    let vlogCtFont = CTFontCreateUIFontForLanguage(.emphasizedSystem, 70, nil) ?? CTFontCreateWithName(".SFUI-Semibold" as CFString, 70, nil)
    let semiboldCtFont = CTFontCreateUIFontForLanguage(.emphasizedSystem, 60, nil) ?? CTFontCreateWithName(".SFUI-Semibold" as CFString, 60, nil)
    let regularCtFont = CTFontCreateUIFontForLanguage(.system, 60, nil) ?? CTFontCreateWithName(".SFUI-Regular" as CFString, 60, nil)
    
    // Overlay 1: "vlog" title (Left aligned)
    let vlogLayer = CATextLayer()
    vlogLayer.string = "vlog"
    vlogLayer.font = vlogCtFont
    vlogLayer.fontSize = 70
    vlogLayer.foregroundColor = UIColor.white.cgColor
    vlogLayer.alignmentMode = .left
    vlogLayer.shadowColor = UIColor.black.cgColor
    vlogLayer.shadowOpacity = 0.95
    vlogLayer.shadowRadius = 4
    vlogLayer.shadowOffset = CGSize(width: 0, height: 2)
    vlogLayer.frame = CGRect(x: 40, y: overlayCenterY - 4, width: 360, height: 86)
    vlogLayer.contentsScale = 2.0
    parentLayer.addSublayer(vlogLayer)
    
    // Overlay 2: Caption (Center aligned)
    if !caption.isEmpty {
      let captionLayer = CATextLayer()
      captionLayer.string = caption
      captionLayer.font = semiboldCtFont
      captionLayer.fontSize = 60
      captionLayer.foregroundColor = UIColor.white.cgColor
      captionLayer.alignmentMode = .center
      captionLayer.shadowColor = UIColor.black.cgColor
      captionLayer.shadowOpacity = 0.95
      captionLayer.shadowRadius = 4
      captionLayer.shadowOffset = CGSize(width: 0, height: 2)
      captionLayer.isWrapped = true
      captionLayer.frame = CGRect(x: 320, y: overlayCenterY, width: 440, height: 80)
      captionLayer.contentsScale = 2.0
      parentLayer.addSublayer(captionLayer)
    }
    
    // Overlay 3: Timestamp Text (Right aligned)
    if !timestamp.isEmpty {
      let timeLayer = CATextLayer()
      timeLayer.string = timestamp
      timeLayer.font = regularCtFont
      timeLayer.fontSize = 60
      timeLayer.foregroundColor = UIColor.white.cgColor
      timeLayer.alignmentMode = .right
      timeLayer.shadowColor = UIColor.black.cgColor
      timeLayer.shadowOpacity = 0.95
      timeLayer.shadowRadius = 4
      timeLayer.shadowOffset = CGSize(width: 0, height: 2)
      timeLayer.frame = CGRect(x: 770, y: overlayCenterY, width: 270, height: 80)
      timeLayer.contentsScale = 2.0
      parentLayer.addSublayer(timeLayer)
    }
    
    let animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: videoLayer, in: parentLayer)
    videoComposition.animationTool = animationTool
    
    let outputURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("collection_export.mp4")
    try? FileManager.default.removeItem(at: outputURL)
    
    guard let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
      reject("ERR_EXPORT_INIT", "Failed to initialize export session", nil)
      return
    }
    
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4
    exportSession.videoComposition = videoComposition
    
    exportSession.exportAsynchronously {
      if exportSession.status == .completed {
        resolve(outputURL.absoluteString)
      } else {
        reject("ERR_EXPORT_FAILED", exportSession.error?.localizedDescription ?? "Export failed", exportSession.error)
      }
    }
  }

  @objc(exportSlideshowVideo:captions:timestamps:resolver:rejecter:)
  func exportSlideshowVideo(_ inputPaths: [String], captions: [String], timestamps: [String], resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard !inputPaths.isEmpty else {
      reject("ERR_NO_CLIPS", "No video clips provided for slideshow export", nil)
      return
    }

    if inputPaths.count == 1 {
      let cap = captions.first ?? ""
      let ts = timestamps.first ?? ""
      exportPortraitVideoWithCaption(inputPaths[0], caption: cap, timestamp: ts, resolver: resolve, rejecter: reject)
      return
    }

    let composition = AVMutableComposition()
    guard let compositionVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
          let compositionAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else {
      reject("ERR_TRACK", "Failed to create composition tracks", nil)
      return
    }
    
    let renderSize = CGSize(width: 1080, height: 1920)
    let boxWidth: CGFloat = 1080.0
    let boxHeight: CGFloat = 607.5
    let boxYOffset: CGFloat = (1920.0 - boxHeight) / 2.0
    
    let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionVideoTrack)
    var currentStartTime = CMTime.zero
    
    let parentLayer = CALayer()
    parentLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.backgroundColor = UIColor.black.cgColor
    
    let videoLayer = CALayer()
    videoLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.addSublayer(videoLayer)
    
    let overlayCenterY: CGFloat = boxYOffset + (boxHeight - 80.0) / 2.0
    let vlogCtFont = CTFontCreateUIFontForLanguage(.emphasizedSystem, 70, nil) ?? CTFontCreateWithName(".SFUI-Semibold" as CFString, 70, nil)
    let semiboldCtFont = CTFontCreateUIFontForLanguage(.emphasizedSystem, 60, nil) ?? CTFontCreateWithName(".SFUI-Semibold" as CFString, 60, nil)
    let regularCtFont = CTFontCreateUIFontForLanguage(.system, 60, nil) ?? CTFontCreateWithName(".SFUI-Regular" as CFString, 60, nil)
    
    struct TextOverlayItem {
      let layer: CALayer
      let startSec: Double
      let durSec: Double
    }
    var overlayItems: [TextOverlayItem] = []
    
    for i in 0..<inputPaths.count {
      var cleanPath = inputPaths[i].replacingOccurrences(of: "file://", with: "")
      if let decoded = cleanPath.removingPercentEncoding {
        cleanPath = decoded
      }
      let asset = AVAsset(url: URL(fileURLWithPath: cleanPath))
      guard let videoTrack = asset.tracks(withMediaType: .video).first else { continue }
      
      let duration = asset.duration
      
      do {
        try compositionVideoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: videoTrack, at: currentStartTime)
        if let audioTrack = asset.tracks(withMediaType: .audio).first {
          try? compositionAudioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: audioTrack, at: currentStartTime)
        }
      } catch {
        continue
      }
      
      let transform = videoTrack.preferredTransform
      let naturalSize = videoTrack.naturalSize
      let transformedRect = CGRect(origin: .zero, size: naturalSize).applying(transform)
      let orientWidth = max(abs(transformedRect.width), 1)
      let orientHeight = max(abs(transformedRect.height), 1)
      let isVerticalPal = orientHeight > orientWidth
      
      var finalTransform = transform
      if isVerticalPal {
        let rot270 = CGAffineTransform(rotationAngle: 3.0 * .pi / 2.0)
        finalTransform = finalTransform.concatenating(rot270)
        let rotBounds = CGRect(origin: .zero, size: naturalSize).applying(finalTransform)
        finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: -rotBounds.origin.x, y: -rotBounds.origin.y))
        let rotW = max(rotBounds.width, 1)
        let rotH = max(rotBounds.height, 1)
        let scale = max(boxWidth / rotW, boxHeight / rotH)
        finalTransform = finalTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
        let fitW = rotW * scale
        let fitH = rotH * scale
        let offX = (boxWidth - fitW) / 2.0
        let offY = (boxHeight - fitH) / 2.0 + boxYOffset
        finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offX, y: offY))
      } else {
        if transformedRect.origin.x < 0 {
          finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: orientWidth, y: 0))
        }
        if transformedRect.origin.y < 0 {
          finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: 0, y: orientHeight))
        }
        let scale = max(boxWidth / orientWidth, boxHeight / orientHeight)
        finalTransform = finalTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
        let fitW = orientWidth * scale
        let fitH = orientHeight * scale
        let offX = (boxWidth - fitW) / 2.0
        let offY = (boxHeight - fitH) / 2.0 + boxYOffset
        finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offX, y: offY))
      }
      
      layerInstruction.setTransform(finalTransform, at: currentStartTime)
      
      let startTimeSec = currentStartTime.seconds
      let durationSec = duration.seconds
      
      let vlogLayer = CATextLayer()
      vlogLayer.string = "vlog"
      vlogLayer.font = vlogCtFont
      vlogLayer.fontSize = 70
      vlogLayer.foregroundColor = UIColor.white.cgColor
      vlogLayer.alignmentMode = .left
      vlogLayer.shadowColor = UIColor.black.cgColor
      vlogLayer.shadowOpacity = 0.95
      vlogLayer.shadowRadius = 4
      vlogLayer.shadowOffset = CGSize(width: 0, height: 2)
      vlogLayer.frame = CGRect(x: 40, y: overlayCenterY - 4, width: 360, height: 86)
      vlogLayer.contentsScale = 2.0
      vlogLayer.opacity = 0.0
      parentLayer.addSublayer(vlogLayer)
      overlayItems.append(TextOverlayItem(layer: vlogLayer, startSec: startTimeSec, durSec: durationSec))
      
      let clipCap = i < captions.count ? captions[i] : ""
      if !clipCap.isEmpty {
        let captionLayer = CATextLayer()
        captionLayer.string = clipCap
        captionLayer.font = semiboldCtFont
        captionLayer.fontSize = 60
        captionLayer.foregroundColor = UIColor.white.cgColor
        captionLayer.alignmentMode = .center
        captionLayer.shadowColor = UIColor.black.cgColor
        captionLayer.shadowOpacity = 0.95
        captionLayer.shadowRadius = 4
        captionLayer.shadowOffset = CGSize(width: 0, height: 2)
        captionLayer.isWrapped = true
        captionLayer.frame = CGRect(x: 320, y: overlayCenterY, width: 440, height: 80)
        captionLayer.contentsScale = 2.0
        captionLayer.opacity = 0.0
        parentLayer.addSublayer(captionLayer)
        overlayItems.append(TextOverlayItem(layer: captionLayer, startSec: startTimeSec, durSec: durationSec))
      }
      
      let clipTime = i < timestamps.count ? timestamps[i] : ""
      if !clipTime.isEmpty {
        let timeLayer = CATextLayer()
        timeLayer.string = clipTime
        timeLayer.font = regularCtFont
        timeLayer.fontSize = 60
        timeLayer.foregroundColor = UIColor.white.cgColor
        timeLayer.alignmentMode = .right
        timeLayer.shadowColor = UIColor.black.cgColor
        timeLayer.shadowOpacity = 0.95
        timeLayer.shadowRadius = 4
        timeLayer.shadowOffset = CGSize(width: 0, height: 2)
        timeLayer.frame = CGRect(x: 770, y: overlayCenterY, width: 270, height: 80)
        timeLayer.contentsScale = 2.0
        timeLayer.opacity = 0.0
        parentLayer.addSublayer(timeLayer)
        overlayItems.append(TextOverlayItem(layer: timeLayer, startSec: startTimeSec, durSec: durationSec))
      }
      
      currentStartTime = CMTimeAdd(currentStartTime, duration)
    }
    
    let totalDurationSec = max(0.1, currentStartTime.seconds)
    for item in overlayItems {
      let anim = CAKeyframeAnimation(keyPath: "opacity")
      let startRatio = max(0.0, item.startSec / totalDurationSec)
      let endRatio = min(1.0, (item.startSec + item.durSec) / totalDurationSec)
      
      anim.keyTimes = [
        0.0,
        NSNumber(value: max(0.0, startRatio - 0.0001)),
        NSNumber(value: startRatio),
        NSNumber(value: endRatio),
        NSNumber(value: min(1.0, endRatio + 0.0001)),
        1.0
      ]
      anim.values = [0.0, 0.0, 1.0, 1.0, 0.0, 0.0]
      anim.duration = totalDurationSec
      anim.beginTime = AVCoreAnimationBeginTimeAtZero
      anim.isRemovedOnCompletion = false
      anim.fillMode = .both
      item.layer.add(anim, forKey: "opacity")
    }
    
    let videoComposition = AVMutableVideoComposition()
    videoComposition.renderSize = renderSize
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30)
    
    let mainInstruction = AVMutableVideoCompositionInstruction()
    mainInstruction.timeRange = CMTimeRange(start: .zero, duration: currentStartTime)
    mainInstruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [mainInstruction]
    
    let animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: videoLayer, in: parentLayer)
    videoComposition.animationTool = animationTool
    
    let outputURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("collection_export.mp4")
    try? FileManager.default.removeItem(at: outputURL)
    
    guard let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
      reject("ERR_EXPORT_INIT", "Failed to initialize export session", nil)
      return
    }
    
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4
    exportSession.videoComposition = videoComposition
    
    exportSession.exportAsynchronously {
      if exportSession.status == .completed {
        resolve(outputURL.absoluteString)
      } else {
        reject("ERR_EXPORT_FAILED", exportSession.error?.localizedDescription ?? "Export failed", exportSession.error)
      }
    }
  }

  @objc(exportPortraitVideoSimple:resolver:rejecter:)
  func exportPortraitVideoSimple(_ inputPath: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    exportPortraitVideoWithCaption(inputPath, caption: "", timestamp: "", resolver: resolve, rejecter: reject)
  }

  @objc(exportRotatedCardVideoOnly:caption:resolver:rejecter:)
  func exportRotatedCardVideoOnly(_ inputPath: String, caption: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    var cleanPath = inputPath.replacingOccurrences(of: "file://", with: "")
    if let decoded = cleanPath.removingPercentEncoding {
      cleanPath = decoded
    }
    
    let inputURL = URL(fileURLWithPath: cleanPath)
    let asset = AVAsset(url: inputURL)
    
    guard let videoTrack = asset.tracks(withMediaType: .video).first else {
      reject("ERR_NO_VIDEO", "No video track found at path: \(cleanPath)", nil)
      return
    }
    
    let composition = AVMutableComposition()
    guard let compositionVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
      reject("ERR_TRACK", "Failed to create track", nil)
      return
    }
    
    do {
      try compositionVideoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: videoTrack, at: .zero)
      
      if let audioTrack = asset.tracks(withMediaType: .audio).first,
         let compositionAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
        try? compositionAudioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: audioTrack, at: .zero)
      }
    } catch {
      reject("ERR_INSERT", error.localizedDescription, error)
      return
    }
    
    let renderSize = CGSize(width: 1080, height: 1920)
    let boxWidth: CGFloat = 1080.0
    let boxHeight: CGFloat = 607.5
    let boxYOffset: CGFloat = (1920.0 - boxHeight) / 2.0

    let videoComposition = AVMutableVideoComposition()
    videoComposition.renderSize = renderSize
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30)
    
    let instruction = AVMutableVideoCompositionInstruction()
    instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
    
    let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionVideoTrack)
    
    let transform = videoTrack.preferredTransform
    let naturalSize = videoTrack.naturalSize
    let transformedRect = CGRect(origin: .zero, size: naturalSize).applying(transform)
    let orientWidth = max(abs(transformedRect.width), 1)
    let orientHeight = max(abs(transformedRect.height), 1)
    
    let isVerticalPal = orientHeight > orientWidth
    
    var finalTransform = transform
    
    if isVerticalPal {
      let rot270 = CGAffineTransform(rotationAngle: 3.0 * .pi / 2.0)
      finalTransform = finalTransform.concatenating(rot270)
      
      let rotBounds = CGRect(origin: .zero, size: naturalSize).applying(finalTransform)
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: -rotBounds.origin.x, y: -rotBounds.origin.y))
      
      let rotW = max(rotBounds.width, 1)
      let rotH = max(rotBounds.height, 1)
      
      let scaleX = boxWidth / rotW
      let scaleY = boxHeight / rotH
      let scale = max(scaleX, scaleY)
      finalTransform = finalTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
      
      let fitW = rotW * scale
      let fitH = rotH * scale
      let offX = (boxWidth - fitW) / 2.0
      let offY = (boxHeight - fitH) / 2.0 + boxYOffset
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offX, y: offY))
    } else {
      if transformedRect.origin.x < 0 {
        finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: orientWidth, y: 0))
      }
      if transformedRect.origin.y < 0 {
        finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: 0, y: orientHeight))
      }
      let scaleX = boxWidth / orientWidth
      let scaleY = boxHeight / orientHeight
      let scale = max(scaleX, scaleY)
      finalTransform = finalTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
      let fitW = orientWidth * scale
      let fitH = orientHeight * scale
      let offX = (boxWidth - fitW) / 2.0
      let offY = (boxHeight - fitH) / 2.0 + boxYOffset
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offX, y: offY))
    }
    
    layerInstruction.setTransform(finalTransform, at: .zero)
    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]
    
    let parentLayer = CALayer()
    parentLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.backgroundColor = UIColor.black.cgColor
    
    let videoLayer = CALayer()
    videoLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.addSublayer(videoLayer)
    
    // Caption Overlay (IF PRESENT): No vlog title, no timestamp text!
    if !caption.isEmpty {
      let semiboldCtFont = CTFontCreateUIFontForLanguage(.emphasizedSystem, 60, nil) ?? CTFontCreateWithName(".SFUI-Semibold" as CFString, 60, nil)
      let overlayCenterY: CGFloat = boxYOffset + (boxHeight - 80.0) / 2.0
      let captionLayer = CATextLayer()
      captionLayer.string = caption
      captionLayer.font = semiboldCtFont
      captionLayer.fontSize = 60
      captionLayer.foregroundColor = UIColor.white.cgColor
      captionLayer.alignmentMode = .center
      captionLayer.shadowColor = UIColor.black.cgColor
      captionLayer.shadowOpacity = 0.95
      captionLayer.shadowRadius = 4
      captionLayer.shadowOffset = CGSize(width: 0, height: 2)
      captionLayer.isWrapped = true
      captionLayer.frame = CGRect(x: 140, y: overlayCenterY, width: 800, height: 80)
      captionLayer.contentsScale = 2.0
      parentLayer.addSublayer(captionLayer)
    }
    
    let animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: videoLayer, in: parentLayer)
    videoComposition.animationTool = animationTool
    
    let outputURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("rotated_card_\(UUID().uuidString).mp4")
    try? FileManager.default.removeItem(at: outputURL)
    
    guard let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
      reject("ERR_EXPORT_INIT", "Failed to initialize export session", nil)
      return
    }
    
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4
    exportSession.videoComposition = videoComposition
    
    exportSession.exportAsynchronously {
      if exportSession.status == .completed {
        resolve(outputURL.absoluteString)
      } else {
        reject("ERR_EXPORT_FAILED", exportSession.error?.localizedDescription ?? "Export failed", exportSession.error)
      }
    }
  }
}
