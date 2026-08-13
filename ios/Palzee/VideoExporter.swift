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
    
    // Output Canvas Geometry: 16:9 Horizontal (1920x1080) for Video 1 style
    let renderSize = CGSize(width: 1920, height: 1080)
    let videoComposition = AVMutableVideoComposition()
    videoComposition.renderSize = renderSize
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30)
    
    let instruction = AVMutableVideoCompositionInstruction()
    instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
    
    let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionVideoTrack)
    
    // Calculate transform based on camera recording orientation
    let transform = videoTrack.preferredTransform
    let naturalSize = videoTrack.naturalSize
    let transformedRect = CGRect(origin: .zero, size: naturalSize).applying(transform)
    let videoWidth = max(abs(transformedRect.width), 1)
    let videoHeight = max(abs(transformedRect.height), 1)
    
    let scaleX = renderSize.width / videoWidth
    let scaleY = renderSize.height / videoHeight
    
    // Apply camera rotation + scale to 1920x1080 frame
    var finalTransform = transform.concatenating(CGAffineTransform(scaleX: scaleX, y: scaleY))
    
    // Adjust translation offset if transform rotated origin off-screen
    if transformedRect.origin.x < 0 {
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: renderSize.width, y: 0))
    }
    if transformedRect.origin.y < 0 {
      finalTransform = finalTransform.concatenating(CGAffineTransform(translationX: 0, y: renderSize.height))
    }
    
    layerInstruction.setTransform(finalTransform, at: .zero)
    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]
    
    // CALayer Setup for 1920x1080
    let parentLayer = CALayer()
    parentLayer.frame = CGRect(x: 0, y: 0, width: 1920, height: 1080)
    
    let videoLayer = CALayer()
    videoLayer.frame = CGRect(x: 0, y: 0, width: 1920, height: 1080)
    parentLayer.addSublayer(videoLayer)
    
    // Overlay 1: "vlog" badge
    let vlogLayer = CATextLayer()
    vlogLayer.string = "vlog"
    vlogLayer.font = UIFont.systemFont(ofSize: 28, weight: .bold)
    vlogLayer.fontSize = 28
    vlogLayer.foregroundColor = UIColor.white.withAlphaComponent(0.9).cgColor
    vlogLayer.backgroundColor = UIColor.black.withAlphaComponent(0.4).cgColor
    vlogLayer.cornerRadius = 10
    vlogLayer.alignmentMode = .center
    vlogLayer.frame = CGRect(x: 48, y: 1080 - 80, width: 120, height: 44)
    vlogLayer.contentsScale = 2.0
    parentLayer.addSublayer(vlogLayer)
    
    // Overlay 2: Caption
    if !caption.isEmpty {
      let captionLayer = CATextLayer()
      captionLayer.string = caption
      captionLayer.font = UIFont.systemFont(ofSize: 36, weight: .semibold)
      captionLayer.fontSize = 36
      captionLayer.foregroundColor = UIColor.white.cgColor
      captionLayer.alignmentMode = .center
      captionLayer.isWrapped = true
      captionLayer.frame = CGRect(x: 60, y: 540 - 40, width: 1800, height: 80)
      captionLayer.contentsScale = 2.0
      parentLayer.addSublayer(captionLayer)
    }
    
    // Overlay 3: Timestamp
    if !timestamp.isEmpty {
      let timeLayer = CATextLayer()
      timeLayer.string = timestamp
      timeLayer.font = UIFont.systemFont(ofSize: 26, weight: .medium)
      timeLayer.fontSize = 26
      timeLayer.foregroundColor = UIColor.white.withAlphaComponent(0.75).cgColor
      timeLayer.alignmentMode = .right
      timeLayer.frame = CGRect(x: 1560, y: 1080 - 74, width: 300, height: 38)
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
