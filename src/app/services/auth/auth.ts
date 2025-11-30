import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export interface IDefaultUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'state_manager' | 'district_manager' | 'block_manager';
  state: string[];
  districts: string[];
  blocks: string[];
  permissions: string[];
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  public defaultUser: IDefaultUser[] = [
    {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin',
      role: 'admin',
      state:['Arunachal Pradesh'],
      districts:['ALL'],
      blocks:['ALL'],
      permissions: [
        'view_projects',
        'add_projects',
        'edit_projects',
        'delete_projects',
      ],
    },
    {
      id: 2,
      name: 'State Manager',
      email: 'state_manager@example.com',
      password: 'state_manager',
      role: 'state_manager',
      state:['Arunachal Pradesh'],
      districts:['ALL'],
      blocks:['ALL'],
      permissions: [
        'view_projects',
      ],
    },
    {
      id: 3,
      name: 'District Manager',
      email: 'district_manager@example.com',
      password: 'district_manager',
      role: 'district_manager',
      state:['Arunachal Pradesh'],
      districts:['DIBANG VALLEY'],
      blocks:['ALL'],
      permissions: [
        'view_projects',
        'add_projects',
        'edit_projects',
        'delete_projects',
      ],
    },
    {
      id: 4,
      name: 'Block Manager',
      email: 'block_manager@example.com',
      password: 'block_manager',
      role: 'block_manager',
      state:['Arunachal Pradesh'],
      districts:['DIBANG VALLEY'],
      blocks:['ANINI'],
      permissions: [
        'view_projects',
        'add_projects',
        'edit_projects',
        'delete_projects',
      ],
    },
  ];
  public currentLoginUser = new BehaviorSubject<IDefaultUser | null>(null);

  public login(email: string, password: string): boolean {
    const user = this.defaultUser.find(user => user.email === email && user.password === password);
    if (user) {
      if (this.isBrowser()) {
        localStorage.setItem('currentLoginUser', JSON.stringify(user));
      }
      this.currentLoginUser.next(user);
      return true;
    }
    return false;
  }

  public logout(): void {
    this.currentLoginUser.next(null);
    if (this.isBrowser()) {
      localStorage.removeItem('currentLoginUser');
    }
  } 

  public getCurrentLoginUser(): IDefaultUser | null {
    if (!this.isBrowser()) {
      return null;
    }
    
    try {
      const user = localStorage.getItem('currentLoginUser');
      if(user){
        const parsedUser = JSON.parse(user);
        this.currentLoginUser.next(parsedUser);
        return parsedUser;
      }else{
        this.currentLoginUser.next(null);
        return null;
      }
    } catch (error) {
      console.error('Error getting current login user:', error);
      this.currentLoginUser.next(null);
      return null;
    }
  } 
}
