import { IProjectData } from '../project/insert-update-project/insert-update-project';

/**
 * Dummy Project Data organized by User Roles
 * 
 * User Roles:
 * - admin: Can see all projects across all districts
 * - state_manager: Can see all projects in Arunachal Pradesh
 * - district_manager: Can see projects in their assigned district (e.g., DIBANG VALLEY)
 * - block_manager: Can see projects in their assigned block (e.g., ANINI in DIBANG VALLEY)
 */

export const dummyProjectData: IProjectData[] = [
  // ========== DIBANG VALLEY DISTRICT ==========
  // Projects visible to: admin, state_manager, district_manager (DIBANG VALLEY), block_manager (ANINI)
  
  {
    projectName: 'MGNRGA',
    activityName: 'Rural Road Construction - Anini Block',
    schemeType: 'Construction / Civil Work',
    locationName: 'Anini Village',
    latitude: 28.8000,
    longitude: 95.9000,
    aoiFile: null,
    beneficiaryName: 'Anini Village Development Committee',
    beneficiaryDetails: 'Construction of 5km rural road connecting Anini village to main highway. Benefits 500+ households.',
    estimatedCost: 2500000,
    finalCost: 2450000,
    fundType: 'Central Government',
    selectedProjectName: 'MGNRGA',
    newProjectName: '',
    selectedSchemeType: 'Construction / Civil Work',
    newSchemeType: '',
    districtName: 'DIBANG VALLEY',
    mouzaName: 'ANINI'
  },
  {
    projectName: 'FOREST & HORTICULTURE',
    activityName: 'Bamboo Plantation Project - Anini',
    schemeType: 'Plantation',
    locationName: 'Anini Forest Area',
    latitude: 28.8100,
    longitude: 95.9100,
    aoiFile: null,
    beneficiaryName: 'Anini Forest Community',
    beneficiaryDetails: 'Bamboo plantation across 50 hectares. Provides sustainable livelihood for 200 families.',
    estimatedCost: 1200000,
    finalCost: 1180000,
    fundType: 'State Government',
    selectedProjectName: 'FOREST & HORTICULTURE',
    newProjectName: '',
    selectedSchemeType: 'Plantation',
    newSchemeType: '',
    districtName: 'DIBANG VALLEY',
    mouzaName: 'ANINI'
  },
  {
    projectName: 'PHED',
    activityName: 'Water Supply Scheme - Anini Block',
    schemeType: 'Water Supply',
    locationName: 'Anini Town',
    latitude: 28.8050,
    longitude: 95.9050,
    aoiFile: null,
    beneficiaryName: 'Anini Municipal Council',
    beneficiaryDetails: 'Installation of water supply system with 10 overhead tanks. Serves 1000+ residents.',
    estimatedCost: 3500000,
    finalCost: 3420000,
    fundType: 'Central Government',
    selectedProjectName: 'PHED',
    newProjectName: '',
    selectedSchemeType: 'Water Supply',
    newSchemeType: '',
    districtName: 'DIBANG VALLEY',
    mouzaName: 'ANINI'
  },
  {
    projectName: 'AGRI-IRRIGATION',
    activityName: 'Irrigation Canal - Anini Agricultural Zone',
    schemeType: 'Water Supply',
    locationName: 'Anini Agricultural Area',
    latitude: 28.8200,
    longitude: 95.9200,
    aoiFile: null,
    beneficiaryName: 'Anini Farmers Cooperative',
    beneficiaryDetails: 'Construction of 8km irrigation canal. Benefits 300 farming families across 200 hectares.',
    estimatedCost: 4200000,
    finalCost: 4100000,
    fundType: 'State Government',
    selectedProjectName: 'AGRI-IRRIGATION',
    newProjectName: '',
    selectedSchemeType: 'Water Supply',
    newSchemeType: '',
    districtName: 'DIBANG VALLEY',
    mouzaName: 'ANINI'
  },

  // ========== KURUNG VALLEY DISTRICT ==========
  // Projects visible to: admin, state_manager
  
  {
    projectName: 'PMGSY',
    activityName: 'Rural Connectivity Road - Koloriang',
    schemeType: 'Transport & Infrastructure',
    locationName: 'Koloriang Town',
    latitude: 27.9000,
    longitude: 93.5000,
    aoiFile: null,
    beneficiaryName: 'Koloriang Development Authority',
    beneficiaryDetails: 'Construction of 12km PMGSY road connecting Koloriang to remote villages. Benefits 800+ households.',
    estimatedCost: 5500000,
    finalCost: 5400000,
    fundType: 'Central Government',
    selectedProjectName: 'PMGSY',
    newProjectName: '',
    selectedSchemeType: 'Transport & Infrastructure',
    newSchemeType: '',
    districtName: 'KURUNG VALLEY',
    mouzaName: 'KOLORIANG'
  },
  {
    projectName: 'PMAY',
    activityName: 'Housing Scheme - Koloriang Block',
    schemeType: 'Construction / Civil Work',
    locationName: 'Koloriang Residential Area',
    latitude: 27.9100,
    longitude: 93.5100,
    aoiFile: null,
    beneficiaryName: 'Koloriang Housing Society',
    beneficiaryDetails: 'Construction of 50 affordable housing units for economically weaker sections.',
    estimatedCost: 15000000,
    finalCost: 14800000,
    fundType: 'Central Government',
    selectedProjectName: 'PMAY',
    newProjectName: '',
    selectedSchemeType: 'Construction / Civil Work',
    newSchemeType: '',
    districtName: 'KURUNG VALLEY',
    mouzaName: 'KOLORIANG'
  },
  {
    projectName: 'MSME',
    activityName: 'Handicraft Training Center - Koloriang',
    schemeType: 'Skills & Workforce Development',
    locationName: 'Koloriang Industrial Area',
    latitude: 27.9200,
    longitude: 93.5200,
    aoiFile: null,
    beneficiaryName: 'Koloriang Handicraft Association',
    beneficiaryDetails: 'Establishment of training center for traditional handicrafts. Trains 100+ artisans annually.',
    estimatedCost: 800000,
    finalCost: 780000,
    fundType: 'State Government',
    selectedProjectName: 'MSME',
    newProjectName: '',
    selectedSchemeType: 'Skills & Workforce Development',
    newSchemeType: '',
    districtName: 'KURUNG VALLEY',
    mouzaName: 'KOLORIANG'
  },

  // ========== EAST KAMENG DISTRICT ==========
  // Projects visible to: admin, state_manager
  
  {
    projectName: 'PMKSY',
    activityName: 'Watershed Development - Seppa',
    schemeType: 'Water Supply',
    locationName: 'Seppa Watershed Area',
    latitude: 27.3000,
    longitude: 93.2000,
    aoiFile: null,
    beneficiaryName: 'Seppa Watershed Committee',
    beneficiaryDetails: 'Watershed development project covering 500 hectares. Improves water availability for agriculture.',
    estimatedCost: 6000000,
    finalCost: 5900000,
    fundType: 'Central Government',
    selectedProjectName: 'PMKSY',
    newProjectName: '',
    selectedSchemeType: 'Water Supply',
    newSchemeType: '',
    districtName: 'EAST KAMENG',
    mouzaName: 'SEPPA'
  },
  {
    projectName: 'RURAL PLANNING',
    activityName: 'Village Infrastructure Development - Seppa',
    schemeType: 'Construction / Civil Work',
    locationName: 'Seppa Village Cluster',
    latitude: 27.3100,
    longitude: 93.2100,
    aoiFile: null,
    beneficiaryName: 'Seppa Village Development Board',
    beneficiaryDetails: 'Development of community centers, drainage systems, and street lighting in 10 villages.',
    estimatedCost: 4500000,
    finalCost: 4400000,
    fundType: 'State Government',
    selectedProjectName: 'RURAL PLANNING',
    newProjectName: '',
    selectedSchemeType: 'Construction / Civil Work',
    newSchemeType: '',
    districtName: 'EAST KAMENG',
    mouzaName: 'SEPPA'
  },

  // ========== WEST KAMENG DISTRICT ==========
  // Projects visible to: admin, state_manager
  
  {
    projectName: 'URBAN PLANNING',
    activityName: 'Smart City Infrastructure - Bomdila',
    schemeType: 'Transport & Infrastructure',
    locationName: 'Bomdila Town',
    latitude: 27.2500,
    longitude: 92.4000,
    aoiFile: null,
    beneficiaryName: 'Bomdila Municipal Corporation',
    beneficiaryDetails: 'Development of smart city infrastructure including traffic management and public facilities.',
    estimatedCost: 12000000,
    finalCost: 11800000,
    fundType: 'Central Government',
    selectedProjectName: 'URBAN PLANNING',
    newProjectName: '',
    selectedSchemeType: 'Transport & Infrastructure',
    newSchemeType: '',
    districtName: 'WEST KAMENG',
    mouzaName: 'BOMDILA'
  },
  {
    projectName: 'MINISTRY OF MINES',
    activityName: 'Mining Safety Infrastructure - Bomdila',
    schemeType: 'Surface Mining',
    locationName: 'Bomdila Mining Zone',
    latitude: 27.2600,
    longitude: 92.4100,
    aoiFile: null,
    beneficiaryName: 'Bomdila Mining Cooperative',
    beneficiaryDetails: 'Installation of safety equipment and infrastructure for small-scale mining operations.',
    estimatedCost: 3200000,
    finalCost: 3100000,
    fundType: 'Central Government',
    selectedProjectName: 'MINISTRY OF MINES',
    newProjectName: '',
    selectedSchemeType: 'Surface Mining',
    newSchemeType: '',
    districtName: 'WEST KAMENG',
    mouzaName: 'BOMDILA'
  },

  // ========== LOWER SUBANSIRI DISTRICT ==========
  // Projects visible to: admin, state_manager
  
  {
    projectName: 'AGRI-IRRIGATION',
    activityName: 'Organic Farming Initiative - Ziro',
    schemeType: 'Production System',
    locationName: 'Ziro Valley',
    latitude: 27.6000,
    longitude: 93.8000,
    aoiFile: null,
    beneficiaryName: 'Ziro Organic Farmers Association',
    beneficiaryDetails: 'Promotion of organic farming practices across 300 hectares. Training and certification for 500 farmers.',
    estimatedCost: 7500000,
    finalCost: 7300000,
    fundType: 'State Government',
    selectedProjectName: 'AGRI-IRRIGATION',
    newProjectName: '',
    selectedSchemeType: 'Production System',
    newSchemeType: '',
    districtName: 'LOWER SUBANSIRI',
    mouzaName: 'ZIRO'
  },
  {
    projectName: 'FOREST & HORTICULTURE',
    activityName: 'Apple Orchard Development - Ziro',
    schemeType: 'Plantation',
    locationName: 'Ziro Hills',
    latitude: 27.6100,
    longitude: 93.8100,
    aoiFile: null,
    beneficiaryName: 'Ziro Horticulture Society',
    beneficiaryDetails: 'Development of apple orchards across 100 hectares. Provides income for 150 farming families.',
    estimatedCost: 5000000,
    finalCost: 4900000,
    fundType: 'State Government',
    selectedProjectName: 'FOREST & HORTICULTURE',
    newProjectName: '',
    selectedSchemeType: 'Plantation',
    newSchemeType: '',
    districtName: 'LOWER SUBANSIRI',
    mouzaName: 'ZIRO'
  },

  // ========== UPPER SUBANSIRI DISTRICT ==========
  // Projects visible to: admin, state_manager
  
  {
    projectName: 'PHED',
    activityName: 'Sewage Treatment Plant - Daporijo',
    schemeType: 'Sewage / Drainage System',
    locationName: 'Daporijo Town',
    latitude: 27.9000,
    longitude: 94.2000,
    aoiFile: null,
    beneficiaryName: 'Daporijo Municipal Council',
    beneficiaryDetails: 'Construction of sewage treatment plant with capacity of 2 MLD. Serves 5000+ residents.',
    estimatedCost: 8500000,
    finalCost: 8300000,
    fundType: 'Central Government',
    selectedProjectName: 'PHED',
    newProjectName: '',
    selectedSchemeType: 'Sewage / Drainage System',
    newSchemeType: '',
    districtName: 'UPPER SUBANSIRI',
    mouzaName: 'DAPORIJO'
  },
  {
    projectName: 'RURAL PLANNING',
    activityName: 'Waste Management System - Daporijo',
    schemeType: 'Waste Management',
    locationName: 'Daporijo Town',
    latitude: 27.9100,
    longitude: 94.2100,
    aoiFile: null,
    beneficiaryName: 'Daporijo Waste Management Authority',
    beneficiaryDetails: 'Implementation of solid waste management system with segregation and recycling facilities.',
    estimatedCost: 2800000,
    finalCost: 2700000,
    fundType: 'State Government',
    selectedProjectName: 'RURAL PLANNING',
    newProjectName: '',
    selectedSchemeType: 'Waste Management',
    newSchemeType: '',
    districtName: 'UPPER SUBANSIRI',
    mouzaName: 'DAPORIJO'
  },

  // ========== TAWANG DISTRICT ==========
  // Projects visible to: admin, state_manager
  
  {
    projectName: 'PMGSY',
    activityName: 'Border Road Connectivity - Tawang',
    schemeType: 'Transport & Infrastructure',
    locationName: 'Tawang Border Area',
    latitude: 27.6000,
    longitude: 91.8000,
    aoiFile: null,
    beneficiaryName: 'Tawang Border Development Authority',
    beneficiaryDetails: 'Construction of strategic border road connecting remote border villages. Length: 25km.',
    estimatedCost: 18000000,
    finalCost: 17500000,
    fundType: 'Central Government',
    selectedProjectName: 'PMGSY',
    newProjectName: '',
    selectedSchemeType: 'Transport & Infrastructure',
    newSchemeType: '',
    districtName: 'TAWANG',
    mouzaName: 'TAWANG'
  },
  {
    projectName: 'MSME',
    activityName: 'Tourism Development Center - Tawang',
    schemeType: 'Skills & Workforce Development',
    locationName: 'Tawang Town',
    latitude: 27.6100,
    longitude: 91.8100,
    aoiFile: null,
    beneficiaryName: 'Tawang Tourism Association',
    beneficiaryDetails: 'Establishment of tourism training center and handicraft emporium. Trains 200+ people annually.',
    estimatedCost: 4200000,
    finalCost: 4100000,
    fundType: 'State Government',
    selectedProjectName: 'MSME',
    newProjectName: '',
    selectedSchemeType: 'Skills & Workforce Development',
    newSchemeType: '',
    districtName: 'TAWANG',
    mouzaName: 'TAWANG'
  }
];

/**
 * Helper function to get projects filtered by user role
 * @param userRole - The role of the current user
 * @param userDistricts - Districts assigned to the user
 * @param userBlocks - Blocks assigned to the user
 * @returns Filtered array of projects based on user permissions
 */
export function getProjectsByUserRole(
  userRole: 'admin' | 'state_manager' | 'district_manager' | 'block_manager',
  userDistricts: string[] = [],
  userBlocks: string[] = []
): IProjectData[] {
  if (userRole === 'admin') {
    // Admin can see all projects
    return dummyProjectData;
  }

  if (userRole === 'state_manager') {
    // State manager can see all projects in the state (all projects in this case)
    return dummyProjectData;
  }

  if (userRole === 'district_manager') {
    // District manager can see projects in their assigned districts
    if (userDistricts.includes('ALL')) {
      return dummyProjectData;
    }
    return dummyProjectData.filter(project => 
      userDistricts.includes(project.districtName)
    );
  }

  if (userRole === 'block_manager') {
    // Block manager can see projects in their assigned blocks
    if (userBlocks.includes('ALL')) {
      // If ALL blocks, show all projects in their districts
      if (userDistricts.includes('ALL')) {
        return dummyProjectData;
      }
      return dummyProjectData.filter(project => 
        userDistricts.includes(project.districtName)
      );
    }
    // Show projects in specific blocks
    return dummyProjectData.filter(project => 
      userDistricts.includes(project.districtName) &&
      userBlocks.includes(project.mouzaName)
    );
  }

  return [];
}

/**
 * Function to initialize dummy project data in localStorage
 * Call this function to populate localStorage with dummy data
 */
export function initializeDummyProjectData(): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const existingData = localStorage.getItem('projectData');
    let shouldInitialize = false;
    
    if (!existingData) {
      shouldInitialize = true;
    } else {
      try {
        const parsed = JSON.parse(existingData);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          shouldInitialize = true;
        }
      } catch (error) {
        console.error('Error parsing existing project data:', error);
        shouldInitialize = true;
      }
    }
    
    if (shouldInitialize) {
      localStorage.setItem('projectData', JSON.stringify(dummyProjectData));
      console.log('Dummy project data initialized in localStorage:', dummyProjectData.length, 'projects');
    } else {
      console.log('Project data already exists in localStorage');
    }
  }
}

