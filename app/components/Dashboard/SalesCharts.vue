<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(ArcElement, Tooltip, Legend)

// 1. Terima Data Dinamis dari Parent
const props = defineProps<{
  labels?: string[];
  data?: number[];
  loading?: boolean;
}>();

// 2. Buat Chart Data Reaktif (Computed)
const chartData = computed(() => ({
  labels: props.labels || ['Makanan', 'Minuman', 'Lainnya'],
  datasets: [
    {
      backgroundColor: ['#0d6efd', '#198754', '#ffc107'],
      // Gunakan data dari props, atau fallback ke 0
      data: props.data || [0, 0, 0], 
      hoverOffset: 4
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}
</script>

<template>
  <div class="card shadow-sm border-0 h-100">
    <div class="card-header bg-white py-3">
      <h5 class="mb-0 fw-bold">Kategori Terlaris</h5>
    </div>
    <div class="card-body d-flex align-items-center justify-content-center position-relative">
      
      <div v-if="loading" class="spinner-border text-primary" role="status"></div>
      
      <div v-else style="height: 250px; width: 250px;">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>

    </div>
  </div>
</template>