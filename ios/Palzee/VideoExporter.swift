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
    
    // Scale factor to COVER the centered 16:9 box with 0 shrinkage
    let scaleX = boxWidth / orientWidth
    let scaleY = boxHeight / orientHeight
    let scale = max(scaleX, scaleY)
    
    var finalTransform = transform
    if transformedRect.origin.x < 0 {
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: orientWidth, y: 0))
    }
    if transformedRect.origin.y < 0 {
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: 0, y: orientHeight))
    }
    
    finalTransform = finalTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
    
    let fitWidth = orientWidth * scale
    let fitHeight = orientHeight * scale
    let offsetX = (boxWidth - fitWidth) / 2.0
    let offsetY = (boxHeight - fitHeight) / 2.0
    
    finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offsetX, y: offsetY))
    
    layerInstruction.setTransform(finalTransform, at: .zero)
    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]
    
    // Parent CALayer (1080x1920 Portrait Canvas with Solid Black Letterbox Margins)
    let parentLayer = CALayer()
    parentLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.backgroundColor = UIColor.black.cgColor
    
    let videoLayer = CALayer()
    videoLayer.frame = CGRect(x: 0, y: boxYOffset, width: boxWidth, height: boxHeight)
    videoLayer.masksToBounds = true
    parentLayer.addSublayer(videoLayer)
    
    // Midpoint Y inside videoLayer (boxHeight = 607.5px, midY = 278px)
    let cardMidY: CGFloat = (boxHeight - 50.0) / 2.0
    
    // Overlay 1: "vlog" title (Left aligned inside video card box)
    let vlogLayer = CATextLayer()
    vlogLayer.string = "vlog"
    vlogLayer.font = UIFont.systemFont(ofSize: 42, weight: .bold)
    vlogLayer.fontSize = 42
    vlogLayer.foregroundColor = UIColor.white.cgColor
    vlogLayer.alignmentMode = .left
    vlogLayer.shadowColor = UIColor.black.cgColor
    vlogLayer.shadowOpacity = 0.95
    vlogLayer.shadowRadius = 4
    vlogLayer.shadowOffset = CGSize(width: 0, height: 2)
    vlogLayer.frame = CGRect(x: 40, y: cardMidY, width: 220, height: 50)
    vlogLayer.contentsScale = 2.0
    videoLayer.addSublayer(vlogLayer)
    
    // Overlay 2: Caption (Center aligned inside video card box)
    if !caption.isEmpty {
      let captionLayer = CATextLayer()
      captionLayer.string = caption
      captionLayer.font = UIFont.systemFont(ofSize: 42, weight: .bold)
      captionLayer.fontSize = 42
      captionLayer.foregroundColor = UIColor.white.cgColor
      captionLayer.alignmentMode = .center
      captionLayer.shadowColor = UIColor.black.cgColor
      captionLayer.shadowOpacity = 0.95
      captionLayer.shadowRadius = 4
      captionLayer.shadowOffset = CGSize(width: 0, height: 2)
      captionLayer.isWrapped = true
      captionLayer.frame = CGRect(x: 260, y: cardMidY, width: 560, height: 50)
      captionLayer.contentsScale = 2.0
      videoLayer.addSublayer(captionLayer)
    }
    
    // Overlay 3: Timestamp Text (Right aligned inside video card box)
    if !timestamp.isEmpty {
      let timeLayer = CATextLayer()
      timeLayer.string = timestamp
      timeLayer.font = UIFont.systemFont(ofSize: 38, weight: .semibold)
      timeLayer.fontSize = 38
      timeLayer.foregroundColor = UIColor.white.cgColor
      timeLayer.alignmentMode = .right
      timeLayer.shadowColor = UIColor.black.cgColor
      timeLayer.shadowOpacity = 0.95
      timeLayer.shadowRadius = 4
      timeLayer.shadowOffset = CGSize(width: 0, height: 2)
      timeLayer.frame = CGRect(x: 830, y: cardMidY, width: 210, height: 50)
      timeLayer.contentsScale = 2.0
      videoLayer.addSublayer(timeLayer)
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
