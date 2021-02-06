import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import {SocketioService} from './socketio.service';
import { StartChatComponent } from './start-chat/start-chat.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { AutofocusDirective } from './autofocus.directive';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';



const routes: Routes = [
  {path: '', component: HomeComponent },
  {path:'chat/:chatid', component:ChatWindowComponent},
  {path:'privacy-policy', component:PrivacyPolicyComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ChatWindowComponent,
    StartChatComponent,
    HomeComponent,
    SafeHtmlPipe,
    AutofocusDirective,
    PrivacyPolicyComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    HttpClientModule,
  ],
  providers: [SocketioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
