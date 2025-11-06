export const useSidebarState = () => {
    return useState<boolean>('isSidebarCollapsed', () => false);
};
