import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { ArrowRight, LogIn, LucideAngularModule, Monitor } from 'lucide-angular';

import { CommonModule } from '@angular/common';
// import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
  sadasdsa
    <div class="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-4"
     style="background-image: url('/assets/images/background.png');">
      <!-- Soft overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-secondary-100/30"></div>

      <div class="relative z-10 w-full max-w-sm">
        <!-- Card สีครีม secondary -->
        <div class="bg-secondary-50/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-secondary-200 overflow-hidden">

          <!-- Header - สี primary -->
          <div class="bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-6 text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <!-- <lucide-icon [img]="MonitorIcon" [size]="32" class="text-primary-600"></lucide-icon> -->
            </div>
            <h1 class="text-2xl font-bold text-white mb-1">CS Portal</h1>
            <p class="text-primary-100 text-sm">ระบบบริการลูกค้า ธ.ก.ส.</p>
          </div>

          <!-- Content -->
          <div class="px-6 py-6">
            <p class="text-center text-secondary-700 mb-5 text-sm">
              กรุณาเข้าสู่ระบบผ่าน BAAC OIDC
            </p>

            <button
              class="group w-full rounded-xl py-3 px-5 font-semibold text-white
                     bg-gradient-to-r from-primary-600 to-primary-500
                     hover:from-primary-500 hover:to-primary-400
                     shadow-lg shadow-primary-600/30 hover:shadow-primary-500/40
                     transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                     flex items-center justify-center gap-2"
            >
              <!-- <lucide-icon [img]="LogInIcon" [size]="20"></lucide-icon> -->
              <span>เข้าสู่ระบบด้วย BAAC Account</span>
            </button>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-5 text-center">
            <p class="text-xs text-secondary-500">ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  readonly LogInIcon = LogIn;
  readonly MonitorIcon = Monitor;
  readonly ArrowRightIcon = ArrowRight;

  // constructor(private authService: AuthService, private router: Router) {
  //   if (this.authService.isAuthenticated()) {

  //     this.router.navigate(['/home']);
  //   }
  // }


  // signIn() {
  //   this.authService.login();
  // }
}
