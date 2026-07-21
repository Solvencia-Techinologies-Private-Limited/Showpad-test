#import "CVProduct.h"
//
//  CVRepWelcomeViewController.m
//  CV3
//
//  Created by mahboud on 10/22/12.
//  Copyright (c) 2012 Optimized.com and Mahboud Zabetian. All rights reserved.
//

#import "CVAppDelegate+Products.h"
#import "CVAppDelegate.h"
#import "CVRepWelcomeViewController.h"
#import "UIAlertController+Additions.h"
#import "NSString+EmailCheck.h"
@import DatadogObjc;

@interface CVRepWelcomeViewController ()
@property(weak, nonatomic) IBOutlet UITextField *salesRepNameField;
@property(weak, nonatomic) IBOutlet UITextField *salesRepEmailField;
@property(weak, nonatomic) IBOutlet UITextField *salesRepSuportRepEmailField;
@property(weak, nonatomic) IBOutlet UIButton *salesRepCountryButton;
@property (weak, nonatomic) IBOutlet UIButton *getStartedButton;
@property (strong, nonatomic) IBOutlet UITableView *welcomeTableView;

- (IBAction)textFieldEdited:(UITextField *)textField;

@end

@implementation CVRepWelcomeViewController {
    UIViewController *_countryPopover;
    
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (IBAction)dismissWelcome {
    [self dismissViewControllerAnimated:YES
                             completion:^{
                             }];
}

- (void)viewDidLoad {
    [super viewDidLoad];
   
 
    // Do any additional setup after loading the view.

    //	UISplitViewController *split = (UISplitViewController *)
    // self.parentViewController.parentViewController;
    //	appDelegate.splitViewController = split;
    CVAppDelegate *appDelegate = (CVAppDelegate *)[[UIApplication sharedApplication] delegate];
    [DDGlobal.rum startViewWithViewController:self name:@"CVRepWelcomeViewController" attributes:@{}];

    _salesRepNameField.text = appDelegate.salesRepName;
    _salesRepEmailField.text = appDelegate.salesRepEmail;
    _salesRepSuportRepEmailField.text = appDelegate.orderProcessingEmail;
    [_salesRepCountryButton setTitle:appDelegate.localizedCountry forState:UIControlStateNormal];
    NSString* infoString = [NSString stringWithFormat:@"%@,%@,%@,%@",
     appDelegate.salesRepName,appDelegate.salesRepEmail,appDelegate.orderProcessingEmail,appDelegate.localizedCountry];
    [appDelegate.logger info:infoString];
    infoString = [NSString stringWithFormat:@"%@",appDelegate.salesRepName];
    [appDelegate.logBuilder setWithLoggerName:infoString];
   
    [DDDatadog setUserInfoWithId:appDelegate.salesRepName name:appDelegate.salesRepName email:appDelegate.salesRepEmail extraInfo:@{@"info":infoString,@"DeviceModel":UIDevice.currentDevice.name,@"DeviceID":UIDevice.currentDevice.identifierForVendor.UUIDString}];

    

#if DEBUG
    if (_salesRepNameField.text.length == 0) {
        _salesRepNameField.text = @"Michaella Ballerini";
        appDelegate.salesRepName = _salesRepNameField.text;
    }
    if (_salesRepEmailField.text.length == 0) {
        _salesRepEmailField.text = @"Michaella.Ballerini@heeloocorp.com";
        appDelegate.salesRepEmail = _salesRepEmailField.text;
    }
    if (_salesRepSuportRepEmailField.text.length == 0) {
        _salesRepSuportRepEmailField.text = @"support@heeloo.com";
        appDelegate.orderProcessingEmail = _salesRepSuportRepEmailField.text;
    }
   infoString = [NSString stringWithFormat:@"%@,%@,%@,%@",
     appDelegate.salesRepName,appDelegate.salesRepEmail,appDelegate.orderProcessingEmail,appDelegate.localizedCountry];
    [appDelegate.logger info:infoString];
   
#endif
}
- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
   
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];

}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    CVAppDelegate *appDelegate = (CVAppDelegate *)[[UIApplication sharedApplication] delegate];
    if (appDelegate.appProduct == Specsavers &&
        indexPath.row == 2) {
        return 0;
    }
    return [super tableView:tableView heightForRowAtIndexPath:indexPath];
}

- (IBAction)textFieldEdited:(UITextField *)textField {
    CVAppDelegate *appDelegate = (CVAppDelegate *)[[UIApplication sharedApplication] delegate];
    if (textField == _salesRepEmailField) {
        appDelegate.salesRepEmail = textField.text;
    } else if (textField == _salesRepNameField) {
        appDelegate.salesRepName = textField.text;
    } else if (textField == _salesRepSuportRepEmailField &&
               ![appDelegate.orderProcessingEmail isEqualToString:textField.text]) {
        appDelegate.orderProcessingEmail = textField.text;
    }
    _getStartedButton.enabled = appDelegate.salesRepEmail.length && appDelegate.salesRepName.length && appDelegate.orderProcessingEmail.length;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    //		myPopover = [(UIStoryboardPopoverSegue *)segue
    // popoverController];
    if ([[segue identifier] isEqualToString:@"CountrySelector"]) {
        CVCountryPickerViewController *vc =
            ((UINavigationController *)segue.destinationViewController)
                .childViewControllers.firstObject;
        _countryPopover = vc;
        vc.delegate = self;
    } else {
        CVAppDelegate *appDelegate = (CVAppDelegate *)[[UIApplication sharedApplication] delegate];
        if (appDelegate.appProduct == Specsavers) {
            [appDelegate loadProductFile:@"Specsavers"];
        }
        else {
            [appDelegate loadProductFile:appDelegate.country];
        }

        UISplitViewController *split =
            (UISplitViewController *)self.parentViewController.parentViewController;
        UINavigationController *navController = split.viewControllers[1];
        [[navController.viewControllers firstObject] performSegueWithIdentifier:@"MoveCartIntoPlace"
                                                                             sender:nil];

        
       
        NSLog(@"%s: prepare for %@", __PRETTY_FUNCTION__, segue.identifier);
    }
}

- (BOOL)shouldPerformSegueWithIdentifier:(NSString *)identifier sender:(id)sender {
    if ([identifier isEqualToString:@"PushCartsInPlace"])
        return YES;
    else if ([identifier isEqualToString:@"CountrySelector"])
        return YES;
    else {
        if (_salesRepEmailField.text.length == 0 || _salesRepNameField.text.length == 0 ||
            _salesRepSuportRepEmailField.text.length == 0) {
            [UIAlertController simpleAlertViewWithTitle:@"Missing Info".localized
                                                message:@"Please enter valid text for all fields.".localized];
            return NO;
        } else if ([_salesRepEmailField.text isEqualToString:_salesRepSuportRepEmailField.text]) {
            [UIAlertController simpleAlertViewWithTitle:@"Check E-mails".localized
                                                message:@"The e-mails cannot be the same.".localized];
            return NO;
        } else {
            if (![_salesRepEmailField.text stringIsValidEmailWithAlert]) return NO;
            if (![_salesRepSuportRepEmailField.text stringIsValidEmailWithAlert]) return NO;

            return YES;
        }
    }
}

- (void)selectCountry:(NSString *)country localizedCountry:(NSString *)localizedCountry {
    if (country) {
        CVAppDelegate *appDelegate = (CVAppDelegate *)[[UIApplication sharedApplication] delegate];
        appDelegate.country = country;
        appDelegate.localizedCountry = localizedCountry;
        [_salesRepCountryButton setTitle:localizedCountry forState:UIControlStateNormal];
    }
    [_countryPopover dismissViewControllerAnimated:YES completion:nil];
}

//- (void)saveTextFields {
//    CVAppDelegate *appDelegate = (CVAppDelegate *)[[UIApplication sharedApplication] delegate];
//    appDelegate.salesRepEmail = _salesRepNameField.text;
//    appDelegate.salesRepName = _salesRepEmailField.text;
//    appDelegate.salesRepSuportRepEmail = _salesRepSuportRepEmailField.text;
//    _getStartedButton.enabled = appDelegate.salesRepEmail.length && appDelegate.salesRepName.length && appDelegate.salesRepSuportRepEmail.length;
//}

@end
