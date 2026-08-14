#import <Foundation/Foundation.h>

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#ifndef RCT_EXTERN_MODULE
#define RCT_EXTERN_MODULE(objc_name, objc_supername) objc_name : objc_supername
#endif
#ifndef RCT_EXTERN_METHOD
#define RCT_EXTERN_METHOD(method) - (void)method;
#endif
#ifndef RCTPromiseResolveBlock
typedef void (^RCTPromiseResolveBlock)(id result);
#endif
#ifndef RCTPromiseRejectBlock
typedef void (^RCTPromiseRejectBlock)(NSString *code, NSString *message, NSError *error);
#endif
#endif

@interface RCT_EXTERN_MODULE(VideoExporter, NSObject)

RCT_EXTERN_METHOD(exportPortraitVideoWithCaption:(NSString *)inputPath
                  caption:(NSString *)caption
                  timestamp:(NSString *)timestamp
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(exportSlideshowVideo:(NSArray *)inputPaths
                  captions:(NSArray *)captions
                  timestamps:(NSArray *)timestamps
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(exportPortraitVideoSimple:(NSString *)inputPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(exportRotatedCardVideoOnly:(NSString *)inputPath
                  caption:(NSString *)caption
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject);

@end
