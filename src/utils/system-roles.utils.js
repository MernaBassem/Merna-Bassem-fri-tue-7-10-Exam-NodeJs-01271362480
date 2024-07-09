// system roles (user and company_HR)
export const systemRoles = {
  USER: "user",
  COMPANY_HR: "company_HR",

};

const { USER, COMPANY_HR} = systemRoles;
// Cases of roles
export const roles = {
  USER_COMPANY_HR: [USER, COMPANY_HR],
  USER:[USER],
  COMPANY_HR:[COMPANY_HR]
};
