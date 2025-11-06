export default defineNuxtRouteMiddleware((to, from) => { 
    if (process.server) {
        return;
    }
    const authToken = useAuthToken();
    const authUser = useAuthUser();

    if (!authToken.value) {
        return navigateTo('/forbidden');
    }

    if (authUser.value?.role !== 'Admin') {
        return navigateTo('/admin/dashboard');
    }
})