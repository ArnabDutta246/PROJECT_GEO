import { Injectable } from '@angular/core';
import { IProjectData } from '../../project/insert-update-project/insert-update-project';
import { IDefaultUser } from '../auth/auth';
import { getProjectsByUserRole, initializeDummyProjectData } from '../../data/dummy-project-data';

@Injectable({
  providedIn: 'root'
})
export class Project {
  
  /**
   * Initialize dummy project data in localStorage
   * Call this method to populate localStorage with dummy data
   */
  initializeDummyData(): void {
    initializeDummyProjectData();
  }

  /**
   * Get projects filtered by user role and permissions
   * @param user - The current logged-in user
   * @returns Filtered array of projects based on user permissions
   */
  getProjectsByUser(user: IDefaultUser | null): IProjectData[] {
    if (!user) {
      return [];
    }

    return getProjectsByUserRole(
      user.role,
      user.districts || [],
      user.blocks || []
    );
  }

  /**
   * Get all projects from localStorage
   * @returns Array of all projects stored in localStorage
   */
  getAllProjectsFromLocalStorage(): IProjectData[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }

    const projects = localStorage.getItem('projectData');
    if (projects) {
      try {
        return JSON.parse(projects) as IProjectData[];
      } catch (error) {
        console.error('Error parsing project data from localStorage:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Get projects from localStorage filtered by user role
   * @param user - The current logged-in user
   * @returns Filtered array of projects from localStorage based on user permissions
   */
  getProjectsFromLocalStorageByUser(user: IDefaultUser | null): IProjectData[] {
    const allProjects = this.getAllProjectsFromLocalStorage();
    
    if (!user) {
      return [];
    }

    if (user.role === 'admin') {
      return allProjects;
    }

    if (user.role === 'state_manager') {
      return allProjects;
    }

    if (user.role === 'district_manager') {
      if (user.districts && user.districts.includes('ALL')) {
        return allProjects;
      }
      return allProjects.filter(project => 
        user.districts && user.districts.includes(project.districtName)
      );
    }

    if (user.role === 'block_manager') {
      if (user.blocks && user.blocks.includes('ALL')) {
        if (user.districts && user.districts.includes('ALL')) {
          return allProjects;
        }
        return allProjects.filter(project => 
          user.districts && user.districts.includes(project.districtName)
        );
      }
      return allProjects.filter(project => 
        user.districts && user.districts.includes(project.districtName) &&
        user.blocks && user.blocks.includes(project.mouzaName)
      );
    }

    return [];
  }
}
