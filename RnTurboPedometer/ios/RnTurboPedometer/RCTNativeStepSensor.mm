#import "RCTNativeStepSensor.h"

#import <CoreMotion/CoreMotion.h>

@interface RCTNativeStepSensor()
@property (nonatomic, strong) CMPedometer *pedometer;
@end

@implementation RCTNativeStepSensor

RCT_EXPORT_MODULE(NativeStepSensor)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    _pedometer = [[CMPedometer alloc] init];
  }
  return self;
}

- (void)isAvailable:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  resolve(@([CMPedometer isStepCountingAvailable]));
}

- (void)getSensorName:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  resolve(@"iOS CMPedometer (today query)");
}

- (void)getStepCount:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  if (![CMPedometer isStepCountingAvailable]) {
    reject(@"E_PEDOMETER_UNAVAILABLE", @"CMPedometer is not available on this device.", nil);
    return;
  }

  NSDate *now = [NSDate date];
  NSDate *startOfDay = [[NSCalendar currentCalendar] startOfDayForDate:now];

  [self.pedometer queryPedometerDataFromDate:startOfDay
                                      toDate:now
                                 withHandler:^(CMPedometerData * _Nullable data, NSError * _Nullable error) {
    if (error != nil) {
      reject(@"E_PEDOMETER_QUERY", error.localizedDescription, error);
      return;
    }

    resolve(data.numberOfSteps ?: @0);
  }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeStepSensorSpecJSI>(params);
}
#endif

@end
