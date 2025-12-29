<script setup lang="ts">
import { useToast } from 'vue-toastification';
import { useTenant } from '~/composables/useTenant';
import { onMounted, onBeforeUnmount } from 'vue';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const authStore = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();

const searchInput = ref('');
const modalTitle = ref('');
const modalMessage = ref('');
const modalConfirmText = ref('Ya, Lanjutkan');
const modalConfirmVariant = ref('primary');
const modalAction = ref<(() => void) | null>(null);

function setupModal(title: string, message: string, confirmText: string, confirmVariant: string, action: () => void) {
  modalTitle.value = title;
  modalMessage.value = message;
  modalConfirmText.value = confirmText;
  modalConfirmVariant.value = confirmVariant;
  modalAction.value = action;
}
function executeConfirmedAction(){
  if(modalAction.value) modalAction.value();
}

// === USE TENANT (NOTE: DO NOT AWAIT) ===
const { tenants, tenantList, page, search, sortBy, sortDir, pending, error, refresh } = useTenant();

// sync local input -> composable when applySearch
function applySearch() {
  search.value = searchInput.value;
  page.value = 1;
}

// handle changePage from global event dispatched by TenantPagination
function onChangePage(e: Event) {
  const detail = (e as CustomEvent).detail;
  if (typeof detail === 'number') page.value = detail;
}

onMounted(() => {
  window.addEventListener('tenant:changePage', onChangePage as EventListener);
});

onBeforeUnmount(() => {
  window.removeEventListener('tenant:changePage', onChangePage as EventListener);
});

async function handleDelete(id: number, nama: string) {
  try {
    await $fetch(`${config.public.apiHost}/api/tenants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    });
    toast.success(`Data Tenant ${nama} berhasil dihapus`);
    refresh();
  } catch (err: any) {
    console.error(err);
    toast.error('Data Tenant Gagal Dihapus');
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Kelola Tenant</h1>
      <NuxtLink to="/admin/tenants/create" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1"></i>
        <span class="d-none d-md-inline">Tambahkan</span>
      </NuxtLink>
    </div>

    <!-- Toolbar -->
    <UIToolbar
      placeholder="Cari tenant berdasarkan nama..."
      :search="search"
      :sortBy="sortBy"
      :sortDir="sortDir"
      @update:search="val => search = val"
      @update:sortBy="val => sortBy = val"
      @update:sortDir="val => sortDir = val"
      @searchApplied="() => { /* parent can handle, but we set via update:search already */ }"
    />

    <div v-if="pending" class="text-center p-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Gagal memuat data tenant: {{ error.message }}
    </div>

    <div v-else-if="tenantList.length > 0">
      <!-- Desktop Table -->
      <TenantTable :tenants="tenantList">
        <template #actions="{ tenant }">
          <NuxtLink :to="`/admin/tenants/${tenant.id}/edit`" class="btn btn-sm btn-outline-secondary me-2">
            <i class="bi bi-pencil-fill"></i> Edit
          </NuxtLink>
          <button class="btn btn-sm btn-danger me-2"> <i class="bi bi-x-circle-fill"></i> Non Aktif </button>
          <NuxtLink :to="`/admin/menu-items?tenant_id=${tenant.id}`" class="btn btn-sm btn-outline-info me-2">
            <i class="bi bi-info-circle-fill"></i> Detail
          </NuxtLink>
          <button
            class="btn btn-sm btn-danger me-2"
            data-bs-toggle="modal"
            data-bs-target="#confirmationModal"
            @click="setupModal('Hapus Tenant', `Apakah anda yakin ingin menghapus ${tenant.nama}?`, 'Ya, Hapus', 'danger', () => handleDelete(tenant.id, tenant.nama))"
          >
            <i class="bi bi-trash-fill"></i> Hapus
          </button>
        </template>

        <template #footer>
          <UIPagination :meta="tenants ? {
            from: tenants.from,
            to: tenants.to,
            total: tenants.total,
            per_page: tenants.per_page,
            prev_page_url: tenants.prev_page_url,
            next_page_url: tenants.next_page_url
          } : null" />
        </template>
      </TenantTable>

      <!-- Mobile Card -->
      <TenantCard :tenants="tenantList">
        <template #actions="{ tenant }">
          <NuxtLink :to="`/admin/tenants/${tenant.id}/edit`" class="btn btn-sm btn-outline-secondary w-100">
            <i class="bi bi-pencil-fill"></i> Edit
          </NuxtLink>
          <button class="btn btn-sm btn-danger w-100"> <i class="bi bi-x-circle-fill"></i> Non Aktif </button>
          <NuxtLink :to="`/admin/menu-items?tenant_id=${tenant.id}`" class="btn btn-sm btn-outline-info w-100">
            <i class="bi bi-info-circle-fill"></i> Detail
          </NuxtLink>
        </template>
      </TenantCard>

      <div class="text-center text-muted small mt-2">
        Halaman {{ tenants?.current_page ?? tenants?.current_page }} dari {{ tenants?.last_page ?? tenants?.last_page }}
      </div>
    </div>

    <div v-else class="alert alert-info">
      <i class="bi bi-info-circle-fill me-2"></i>
      Tidak ada tenant yang cocok dengan pencarianmu.
    </div>

    <ModalConfirmation
      modalId="confirmationModal"
      :title="modalTitle"
      :message="modalMessage"
      :confirmText="modalConfirmText"
      :confirmVariant="modalConfirmVariant"
      @onConfirm="executeConfirmedAction"
    />
  </div>
</template>

<style scoped>
.table { vertical-align: middle; }
.table thead th { color: #6c757d; font-weight: 600; }
</style>
