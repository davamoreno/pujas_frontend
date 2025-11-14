export const useSidebarState = () => {
    // return useState<boolean>('isSidebarCollapsed', () => false);

    const isCollapsed = useCookie<boolean>('sidebar-collapsed', { 
        default: () => false,
        maxAge: 60 * 60 * 24 * 7 // Ingat status ini selama 7 hari
    });

    const toggle = () => {
        isCollapsed.value = !isCollapsed.value;
    };

    return {
        isCollapsed,
        toggle,
    };
};
