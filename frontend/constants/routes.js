export const routes = {
  splash: '/splash',
  welcome: '/welcome',
  login: '/login',
  register: '/register',
  language: '/onboarding/language',
  profession: '/onboarding/profession',
  niches: '/onboarding/niches',
  voice: '/onboarding/voice',
  time: '/onboarding/time',
  notifications: '/onboarding/notifications',
  ready: '/onboarding/ready',
  brief: '/brief',
  discover: '/discover',
  settings: '/settings',
  billing: '/billing',
  saved: '/saved',
};
export const legacyScreens = { ...routes, login: routes.welcome };
