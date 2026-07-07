export const attendanceStore = {
  // Global Toggles (Only Superadmin can edit)
  settings: {
    isModuleEnabled: true,
    showDashboardCards: true,
    showReports: true,
    enableNotifications: true,
    enableAIAnalysis: true,
    showPercentageCards: true,
  },

  // Users excluded globally from attendance requirements
  excludedRoles: [
    'governor', 
    'deputy_governor', 
    'chief_of_staff', 
    'deputy_chief_of_staff', 
    'ssg',
    'political_appointee',
    'special_adviser',
    'board_member',
    'commissioner',
    'civil_service_commission'
  ],

  // Check if a user is eligible for attendance
  isUserEligible(roleId: string, customPermission: boolean = true) {
    if (!this.settings.isModuleEnabled) return false;
    if (this.excludedRoles.includes(roleId)) return false;
    return customPermission;
  },

  // Mock Attendance Statistics
  getMockStats() {
    return {
      attendancePercentage: 92,
      presentDays: 18,
      absentDays: 2,
      lateDays: 1,
      trend: "+4% vs Last Month",
      departmentAverage: 88,
      rank: "Top 15%",
      aiSummary: "Your attendance is exceptionally consistent. Based on historical data, you are maintaining a highly productive schedule with minimal disruptions.",
    };
  }
};
