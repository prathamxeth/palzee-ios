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
  func exportPortraitVideoWithCaption(_ inputPath: String, caption: String, timestamp: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
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
    
    let isPortraitInput = orientHeight > orientWidth
    
    var finalTransform = transform
    
    if isPortraitInput {
      // 1. Rotate 270 degrees counter-clockwise matching VlogSheet.tsx rotate: '270deg' logic
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
    
    layerInstruction.setTransform(finalTransform, at: .zero)
    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]
    
    // Parent CALayer (1080x1920 Portrait Canvas with Solid Black Letterbox Margins)
    let parentLayer = CALayer()
    parentLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.backgroundColor = UIColor.black.cgColor
    
    let videoLayer = CALayer()
    videoLayer.frame = CGRect(x: 0, y: boxYOffset, width: boxWidth, height: boxHeight)
    parentLayer.addSublayer(videoLayer)
    
    // Center Overlay Y Midpoint (In CoreAnimation, Y=0 is bottom: 656.25 + 303.75 = 960px)
    let overlayCenterY: CGFloat = 960.0
    
    // Overlay 1: "vlog" title (Left aligned, 44pt text matching VlogSheet ratio)
    let vlogLayer = CATextLayer()
    vlogLayer.string = "vlog"
    vlogLayer.font = UIFont.systemFont(ofSize: 44, weight: .bold)
    vlogLayer.fontSize = 44
    vlogLayer.foregroundColor = UIColor.white.cgColor
    vlogLayer.alignmentMode = .left
    vlogLayer.shadowColor = UIColor.black.cgColor
    vlogLayer.shadowOpacity = 0.85
    vlogLayer.shadowRadius = 4
    vlogLayer.shadowOffset = CGSize(width: 0, height: 2)
    vlogLayer.frame = CGRect(x: 50, y: overlayCenterY - 26, width: 220, height: 52)
    vlogLayer.contentsScale = 2.0
    parentLayer.addSublayer(vlogLayer)
    
    // Overlay 2: Caption (Center aligned, 48pt text matching VlogSheet ratio)
    if !caption.isEmpty {
      let captionLayer = CATextLayer()
      captionLayer.string = caption
      captionLayer.font = UIFont.systemFont(ofSize: 48, weight: .bold)
      captionLayer.fontSize = 48
      captionLayer.foregroundColor = UIColor.white.cgColor
      captionLayer.alignmentMode = .center
      captionLayer.shadowColor = UIColor.black.cgColor
      captionLayer.shadowOpacity = 0.85
      captionLayer.shadowRadius = 4
      captionLayer.shadowOffset = CGSize(width: 0, height: 2)
      captionLayer.isWrapped = true
      captionLayer.frame = CGRect(x: 270, y: overlayCenterY - 28, width: 540, height: 56)
      captionLayer.contentsScale = 2.0
      parentLayer.addSublayer(captionLayer)
    }
    
    // Overlay 3: Timestamp Text (Right aligned, 40pt text matching VlogSheet ratio)
    if !timestamp.isEmpty {
      let timeLayer = CATextLayer()
      timeLayer.string = timestamp
      timeLayer.font = UIFont.systemFont(ofSize: 40, weight: .semibold)
      timeLayer.fontSize = 40
      timeLayer.foregroundColor = UIColor.white.cgColor
      timeLayer.alignmentMode = .right
      timeLayer.shadowColor = UIColor.black.cgColor
      timeLayer.shadowOpacity = 0.85
      timeLayer.shadowRadius = 4
      timeLayer.shadowOffset = CGSize(width: 0, height: 2)
      timeLayer.frame = CGRect(x: 820, y: overlayCenterY - 24, width: 210, height: 48)
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

  @objc(exportPortraitVideoSimple:resolver:rejecter:)
  func exportPortraitVideoSimple(_ inputPath: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    exportPortraitVideoWithCaption(inputPath, caption: "", timestamp: "", resolve: resolve, reject: reject)
  }
}
