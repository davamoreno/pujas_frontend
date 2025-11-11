<template>
    <div style="margin-left: 24px; margin-right: 24px; margin-top: 24px;">
        <!-- Header -->
        <div style="margin-bottom: 32px;">
            <span class="d-flex align-items-start justify-content-between">
                <button @click="$router.back()"
                    class="d-flex justify-content-center align-items-center btn border rounded-circle"
                    style="height: 44px; width: 44px;">
                    <img src="/../public/img/arroww.svg" />
                </button>
                <h4 class="my-auto">Keranjang</h4>
                <div></div>
            </span>
        </div>

        <!-- Content -->
        <div>
            <!-- Pesanan -->
            <h4 class="fw-semibold" style="margin-bottom: 24px;">Pesanan</h4>
            <small style="opacity: 50%;">Wr. Bu Mang</small>
            <div class="border rounded-3"
                style="padding-top: 10px; padding-bottom: 2px; padding-left: 12px; padding-right: 12px; margin-top: 12px; margin-bottom: 24px;">

                <div class="row" style="margin-bottom: 8px;">
                    <div class="d-flex col-8">
                        <img src="/img/geprek.png" alt="" style="height: 50px; width: 50px; margin-right: 12px;">
                        <span>
                            <p class="fw-medium mb-0">Nasi Ayam Geprek</p>
                            <small style="opacity: 50%;">{{ quantity }} Item</small>
                        </span>
                    </div>
                    <div class="col-4 my-auto">
                        <span class="d-flex justify-content-end">
                            <button @click="changeQty(-1)" class=" d-flex justify-content-center align-items-center btn border-black
                                rounded-circle" style="height: 24px; width: 24px;">-</button>
                            <p class="fw-medium mb-0" style="margin-left: 15px; margin-right: 15px;">{{ quantity }}</p>
                            <button @click="changeQty(1)"
                                class="d-flex justify-content-center align-items-center btn border-black rounded-circle"
                                style="height: 24px; width: 24px;">+</button>
                        </span>
                    </div>
                </div>

            </div>

            <!-- Pembayaran -->
            <h4 class="fw-semibold" style="margin-bottom: 12px;">Pilih Pembayaran</h4>

            <button type="button" @click="selectedPayment = 'qris'"
                class="btn rounded-3 d-flex flex-column align-items-start w-100 mb-3"
                :class="selectedPayment === 'qris' ? 'border-primary border-3' : 'border'"
                style="padding: 12px; text-align: left;">

                <div class="d-flex flex-column align-items-start">
                    <img src="/img/QRIS.svg" alt="QRIS" style="margin-bottom: 12px;">
                    <p class="mb-0">Rp15.000</p>
                </div>
            </button>

            <button type="button" @click="selectedPayment = 'tunai'"
                class="btn rounded-3 d-flex flex-column align-items-start w-100 mb-5"
                :class="selectedPayment === 'tunai' ? 'border-primary border-3' : 'border'"
                style="padding: 12px; text-align: left;">

                <div class="d-flex flex-column align-items-start">
                    <p style="margin-bottom: 12px; height: 10%;" class="fs-3 fw-medium">Pembayaran Tunai</p>
                    <p class="mb-0">Rp15.000</p>
                </div>
            </button>

            <button class="btn rounded-3"
                style="padding-top: 12px; padding-bottom: 12px; padding-left: 12px; padding-right: 12px; margin-top: 12px; margin-bottom: 32px; width: 100%; height: 60px; background-color: #27C840; color: white;">
                Bayar Sekarang
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const quantity = ref(1)
const note = ref('')
const selectedPayment = ref('qris')

function changeQty(amount: number) {
    quantity.value = Math.max(1, quantity.value + amount)
}
</script>