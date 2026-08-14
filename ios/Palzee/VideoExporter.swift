import Foundation
import AVFoundation
import UIKit
import React

@objc(VideoExporter)
class VideoExporter: NSObject {
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(exportPortraitVideo:caption:timestamp:resolver:rejecter:)
  func exportPortraitVideo(_ inputPath: String, caption: String, timestamp: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let cleanPath = inputPath.replacingOccurrences(of: "file://", with: "")
    let inputURL = URL(fileURLWithPath: cleanPath)
    let asset = AVAsset(url: inputURL)
    
    guard let videoTrack = asset.tracks(withMediaType: .video).first else {
      reject("ERR_NO_VIDEO", "No video track found", nil)
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
    
    // Output Canvas Geometry: 9:16 Native Portrait (1080x1920)
    let renderSize = CGSize(width: 1080, height: 1920)
    let boxWidth: CGFloat = 1080.0
    let boxHeight: CGFloat = 607.5 // (1080 * 9 / 16)
    let boxYOffset: CGFloat = (1920.0 - boxHeight) / 2.0 // 656.25px (Centered vertically in 9:16 canvas)

    let videoComposition = AVMutableVideoComposition()
    videoComposition.renderSize = renderSize
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30)
    
    let instruction = AVMutableVideoCompositionInstruction()
    instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
    
    let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionVideoTrack)
    
    let transform = videoTrack.preferredTransform
    let naturalSize = videoTrack.naturalSize
    let transformedRect = CGRect(origin: .zero, size: naturalSize).applying(transform)
    let videoWidth = max(abs(transformedRect.width), 1)
    let videoHeight = max(abs(transformedRect.height), 1)
    
    let scaleX = boxWidth / videoWidth
    let scaleY = boxHeight / videoHeight
    let scale = max(scaleX, scaleY)
    
    var finalTransform = transform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
    if transformedRect.origin.x < 0 {
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: boxWidth, y: 0))
    }
    if transformedRect.origin.y < 0 {
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: 0, y: boxHeight))
    }
    
    let clipWidth = videoWidth * scale
    let clipHeight = videoHeight * scale
    let offsetX = (boxWidth - clipWidth) / 2.0
    let offsetY = (boxHeight - clipHeight) / 2.0 + boxYOffset
    
    finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: offsetX, y: offsetY))
    
    layerInstruction.setTransform(finalTransform, at: .zero)
    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]
    
    // Parent CALayer (1080x1920 Portrait Canvas with Black Letterbox Fill)
    let parentLayer = CALayer()
    parentLayer.frame = CGRect(x: 0, y: 0, width: 1080, height: 1920)
    parentLayer.backgroundColor = UIColor.black.cgColor
    
    let videoLayer = CALayer()
    videoLayer.frame = CGRect(x: 0, y: boxYOffset, width: boxWidth, height: boxHeight)
    parentLayer.addSublayer(videoLayer)
    
    // Center Overlay Y Midpoint (In CoreAnimation, Y=0 is bottom: 656.25 + 303.75 = 960)
    let overlayCenterY: CGFloat = 960.0
    
    // Overlay 1: "vlog" title (Left aligned)
    let vlogLayer = CATextLayer()
    vlogLayer.string = "vlog"
    vlogLayer.font = UIFont.systemFont(ofSize: 42, weight: .bold)
    vlogLayer.fontSize = 42
    vlogLayer.foregroundColor = UIColor.white.cgColor
    vlogLayer.alignmentMode = .left
    vlogLayer.shadowColor = UIColor.black.cgColor
    vlogLayer.shadowOpacity = 0.8
    vlogLayer.shadowRadius = 4
    vlogLayer.shadowOffset = CGSize(width: 0, height: 2)
    vlogLayer.frame = CGRect(x: 40, y: overlayCenterY - 26, width: 200, height: 52)
    vlogLayer.contentsScale = 2.0
    parentLayer.addSublayer(vlogLayer)
    
    // Overlay 2: Caption (Center aligned)
    if !caption.isEmpty {
      let captionLayer = CATextLayer()
      captionLayer.string = caption
      captionLayer.font = UIFont.systemFont(ofSize: 34, weight: .bold)
      captionLayer.fontSize = 34
      captionLayer.foregroundColor = UIColor.white.cgColor
      captionLayer.alignmentMode = .center
      captionLayer.shadowColor = UIColor.black.cgColor
      captionLayer.shadowOpacity = 0.8
      captionLayer.shadowRadius = 4
      captionLayer.shadowOffset = CGSize(width: 0, height: 2)
      captionLayer.isWrapped = true
      captionLayer.frame = CGRect(x: 220, y: overlayCenterY - 26, width: 640, height: 52)
      captionLayer.contentsScale = 2.0
      parentLayer.addSublayer(captionLayer)
    }
    
    // Overlay 3: Timestamp Text (Right aligned)
    if !timestamp.isEmpty {
      let timeLayer = CATextLayer()
      timeLayer.string = timestamp
      timeLayer.font = UIFont.systemFont(ofSize: 32, weight: .semibold)
      timeLayer.fontSize = 32
      timeLayer.foregroundColor = UIColor.white.cgColor
      timeLayer.alignmentMode = .right
      timeLayer.shadowColor = UIColor.black.cgColor
      timeLayer.shadowOpacity = 0.8
      timeLayer.shadowRadius = 4
      timeLayer.shadowOffset = CGSize(width: 0, height: 2)
      timeLayer.frame = CGRect(x: 840, y: overlayCenterY - 26, width: 200, height: 52)
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

  @objc(exportPortraitVideo:resolver:rejecter:)
  func exportPortraitVideoSimple(_ inputPath: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    exportPortraitVideo(inputPath, caption: "", timestamp: "", resolve: resolve, reject: reject)
  }
}
