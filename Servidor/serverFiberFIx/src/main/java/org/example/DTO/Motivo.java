package org.example.DTO;

/**
 * Enumeración de motivos para incidencias o etiquetas de tickets.
 * Proporciona una lista predefinida de razones comunes y permite valores personalizados.
 */
public enum Motivo {
    CLIENTE_AUSENTE("Cliente Ausente"),
    INSTALACION_ROTA("Instalación Rota"),
    FALTA_MATERIAL("Falta Material"),
    SIN_ACCESO("Sin Acceso"),
    PERRO_SUELTO("Perro Suelto"),
    OTROS("Otros");

    private final String displayName;

    Motivo(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Obtiene el enum a partir del nombre de visualización.
     * Si no coincide con ninguno, retorna OTROS para valores personalizados.
     */
    public static Motivo fromString(String value) {
        if (value == null || value.isEmpty()) {
            return OTROS;
        }

        for (Motivo motivo : Motivo.values()) {
            if (motivo.displayName.equalsIgnoreCase(value)) {
                return motivo;
            }
        }

        // Si no coincide con un enum predefinido, retorna OTROS (para valores personalizados)
        return OTROS;
    }

    /**
     * Obtiene todos los motivos predefinidos (excluyendo OTROS para la lista predefinida).
     */
    public static String[] getPredefinedMotivos() {
        return new String[]{
            CLIENTE_AUSENTE.displayName,
            INSTALACION_ROTA.displayName,
            FALTA_MATERIAL.displayName,
            SIN_ACCESO.displayName,
            PERRO_SUELTO.displayName
        };
    }
}
