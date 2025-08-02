#import "SharedDefaults.h"
#import <Foundation/Foundation.h>
#import "go2go_mobile-Swift.h"

@implementation SharedDefaults

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(saveTodos:(NSArray *)todos
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    NSUserDefaults *shared = [[NSUserDefaults alloc]
                              initWithSuiteName:@"group.go2go.widget.todo"];
    
    NSArray *topThreeTodos = [todos subarrayWithRange:NSMakeRange(0, MIN(3, todos.count))];
    [shared setObject:topThreeTodos forKey:@"todos"];
    [shared synchronize];

    // ✅ Swift Bridge 호출
    [WidgetBridge reloadAllWidgets];

    resolve(@"true");
  } @catch (NSException *exception) {
    reject(@"save_error", exception.reason, nil);
  }
}
@end
