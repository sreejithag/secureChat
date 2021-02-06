import { Component } from '@angular/core';
import { StackLayout, Enums } from '@nativescript/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  
  title = 'NativeScript';
  cnt = 3;
  private messageLayout: StackLayout;
  private successLayout: StackLayout;

  tapMe() {
    this.cnt--;
    if (this.cnt === 0) {
      this.messageLayout
        .animate({
          translate: { x: 0, y: 150 },
          opacity: 0,
          duration: 400,
          curve: Enums.AnimationCurve.easeOut,
        })
        .then(() => {
          this.successLayout.translateY = 150;
          this.successLayout.animate({
            translate: { x: 0, y: 0 },
            opacity: 1,
            duration: 300,
            curve: Enums.AnimationCurve.easeInOut,
          });
        });
    }
  }

  loadedContainer(args) {
    this.messageLayout = args.object;
  }

  loadedSuccess(args) {
    this.successLayout = args.object;
  }
  
}
