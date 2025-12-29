import type { Tenant } from '~/types/api/tenant';
import type { PaginatedResponse } from '~/types/api/pagination';
import { useAuthStore } from '~/stores/auth';
import { ref } from 'vue';

export function useTenant() {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();

    const page = ref(1);
    const perPage = ref(10);
    const totalTenants = ref(0);
    const loading = ref(false);
    const search = ref('');
    const sortBy = ref('nama');
    const sortDir = ref('asc');

    const { data: tenants, pending, error, refresh } = useFetch<PaginatedResponse<Tenant>>(
    () =>
    {
      const params = new URLSearchParams();
      params.append('page', page.value.toString());
      params.append('per_page', perPage.value.toString());
      if (search.value) {
        params.append('search', search.value);
      }
      params.append('sort_by', sortBy.value);
      params.append('sort_dir', sortDir.value);
      return `${config.public.apiHost}/api/tenants?${params.toString()}`;
    },
    {
      lazy: true,
      onRequest({ request, options }) {
        if (authStore.token) {
          options.headers = new Headers(options.headers);
          options.headers.set('Authorization', `Bearer ${authStore.token}`);
          options.headers.set('Accept', 'application/json');
        }
      },
      onResponseError({ request, response, options }) {
        if (response.status === 401) {
          authStore.logout();
        }
      }
    });

    const tenantList = computed(() => tenants.value?.data || []);

    return {
    page,
    search,
    sortBy,
    sortDir,
    tenants,
    tenantList,
    pending,
    error,
    refresh,
  }
}