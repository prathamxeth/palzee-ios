#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoExporter, NSObject)

RCT_EXTERN_METHOD(exportPortraitVideoWithCaption:(NSString *)inputPath
                  caption:(NSString *)caption
                  timestamp:(NSString *)timestamp
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(exportSlideshowVideo:(NSArray *)inputPaths
                  captions:(NSArray *)captions
                  timestamps:(NSArray *)timestamps
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(exportPortraitVideoSimple:(NSString *)inputPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
