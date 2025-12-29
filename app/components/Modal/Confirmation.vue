<script setup lang="ts">
defineProps({
    modalId         : String,
    title           : String,
    message         : String,
    confirmText     : String,
    confirmVariant  : String
});

const emit = defineEmits(['onConfirm']);

function handleConfirm() {
    emit('onConfirm');
}
</script>

<template>
    <div class="modal fade" :id="modalId" tabindex="-1" :aria-labelledby="`${modalId}`">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" :id="`${modalId}Label`">{{ title }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p v-html="message"></p>
                </div>
                <div class="modal-footer">
                    <!-- <button class="btn btn-primary" type="button" @click="handleConfirm" data-bs-dismiss="modal">
                        {{ confirmText }}
                    </button>
                    <button class="btn btn-danger" type="button" data-bs-dismiss="modal">
                        {{ cancelText }}
                    </button> -->
                    <button class="btn btn-danger" type="button" data-bs-dismiss="modal">
                        Batal
                    </button>
                    <button :class="`btn btn-${confirmVariant || 'primary'}`" type="button" @click="handleConfirm" data-bs-dismiss="modal">
                        {{ confirmText || 'Ya, Lanjutkan'  }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>