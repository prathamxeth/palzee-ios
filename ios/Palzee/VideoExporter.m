#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoExporter, NSObject)

RCT_EXTERN_METHOD(exportPortraitVideo:(NSString *)inputPath
                  caption:(NSString *)caption
                  timestamp:(NSString *)timestamp
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(exportPortraitVideo:(NSString *)inputPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
