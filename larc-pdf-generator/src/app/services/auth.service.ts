// import { Injectable, signal, Inject } from '@angular/core';
// import { OidcSecurityService } from 'angular-auth-oidc-client';
// import { User } from '../models/user.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   isAuthenticated = signal<boolean>(false);
//   currentUser = signal<User | null>(null);

//   constructor(@Inject(OidcSecurityService) public oidcSecurityService: OidcSecurityService) {
//     this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
//       this.isAuthenticated.set(isAuthenticated);
//       if (isAuthenticated) {
//         this.loadUserProfile();
//       } else {
//         this.currentUser.set(null);
//       }
//     });
//   }

//   checkAuth() {
//     return this.oidcSecurityService.checkAuth();
//   }

//   private loadUserProfile() {
//     this.oidcSecurityService.userData$.subscribe((userDataResult) => {
//       if (userDataResult.userData) {
//         const tokenPayload = userDataResult.userData; 
//         const user: User = {
//           id: tokenPayload.employee_id,
//           username: tokenPayload.preferred_username,
//           email: tokenPayload.email,
//           fullName: tokenPayload.name,
//           avatar: '👨‍💼',
//           title_th: tokenPayload.title_th,
//           given_name: tokenPayload.given_name,
//           family_name: tokenPayload.family_name,
//           position: tokenPayload.position,
//           job: tokenPayload.job,
//           job_id: tokenPayload.job_id,
//           org: tokenPayload.org
//         };
//         this.currentUser.set(user);
//       }
//     });
//   }

//   login() {
//     this.oidcSecurityService.authorize();
//   }

//   logout() {
//     this.oidcSecurityService.logoff().subscribe();
//   }

//   getCurrentUser(): User | null {
//     return this.currentUser();
//   } 

// }
