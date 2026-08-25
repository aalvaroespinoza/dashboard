import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  User,
  X,
  GraduationCap,
  Calendar,
} from 'lucide-react-native';
import { ClassItem } from '../hooks/useTodaySchedule';
import { IOS_COLORS } from '../../../styles/theme';
import { useAppStore } from '../../../store/useAppStore';

interface ClassTimelineTabletProps {
  materiasDelDia: ClassItem[];
  isToday: boolean;
  horaActualHHMM: string;
  linePosition: 'none' | 'before' | 'inside' | 'after';
  activeIndex: number;
  attendedClasses: Record<string, boolean>;
  onToggleAttendance: (index: number) => void;
  isDark?: boolean;
}

export const ClassTimelineTablet: React.FC<ClassTimelineTabletProps> = ({
  materiasDelDia,
  isToday,
  horaActualHHMM,
  activeIndex,
  attendedClasses,
  onToggleAttendance,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const [selectedMateriaDetail, setSelectedMateriaDetail] = useState<ClassItem | null>(null);

  if (materiasDelDia.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 24,
          padding: 36,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.border,
          gap: 12,
        }}
      >
        <GraduationCap size={36} color={theme.text.tertiary} />
        <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text.primary }}>
          Sin materias programadas para hoy 🏠
        </Text>
        <Text style={{ fontSize: 13, color: theme.text.secondary, textAlign: 'center' }}>
          Día libre de cursado académico en la facultad. Podés aprovechar para estudiar o descansar.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 16,
      }}
    >
      {/* Header del Cursado */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Clock size={18} color={IOS_COLORS.purple} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '900',
              color: theme.text.primary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Cursado / Horario del día
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.cardSecondary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
            {materiasDelDia.length} {materiasDelDia.length === 1 ? 'materia' : 'materias'}
          </Text>
        </View>
      </View>

      {/* Timeline Vertical de Materias */}
      <View style={{ gap: 14 }}>
        {materiasDelDia.map((materia, idx) => {
          const isAttended = Boolean(attendedClasses[`class-${idx}`]);

          // Determinar si la clase está en curso actualmente
          const isCurrentClass =
            isToday &&
            horaActualHHMM >= materia.horaInicio &&
            horaActualHHMM <= materia.horaFin;

          const isNextClass =
            isToday &&
            horaActualHHMM < materia.horaInicio &&
            idx === activeIndex;

          const accentColor = materia.color || (idx === 0 ? '#34C759' : idx === 1 ? '#AF52DE' : '#007AFF');

          // Cálculo del porcentaje de progreso de la clase en vivo
          let progressPercent = 0;
          if (isCurrentClass) {
            const [sh, sm] = materia.horaInicio.split(':').map(Number);
            const [eh, em] = materia.horaFin.split(':').map(Number);
            const [ch, cm] = horaActualHHMM.split(':').map(Number);
            const start = sh * 60 + sm;
            const end = eh * 60 + em;
            const curr = ch * 60 + cm;
            if (end > start) {
              progressPercent = Math.min(100, Math.max(0, Math.round(((curr - start) / (end - start)) * 100)));
            }
          }

          return (
            <View
              key={idx}
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 18,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: accentColor,
                borderWidth: 1,
                borderColor: isCurrentClass ? accentColor : theme.border,
                gap: 12,
              }}
            >
              {/* Top Row: Nombre de materia + Badge Curso */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: theme.text.primary, lineHeight: 20 }}>
                    {materia.nombre}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary, marginTop: 4 }}>
                    {materia.horaInicio} - {materia.horaFin} hs
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '900', color: accentColor }}>
                    {materia.curso || '2K3'}
                  </Text>
                </View>
              </View>

              {/* Status en Vivo con Barra de Progreso */}
              {isCurrentClass && (
                <View style={{ gap: 6 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' }} />
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#34C759' }}>
                        En curso ahora · {progressPercent}%
                      </Text>
                    </View>
                  </View>

                  {/* Barra de Progreso Dinámica */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5EA',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor: '#34C759',
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              )}

              {/* Info: Aula y Docente */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} color={theme.text.tertiary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                    Aula: {materia.aula}
                  </Text>
                </View>

                {materia.docente && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <User size={14} color={theme.text.tertiary} />
                    <Text style={{ fontSize: 12, color: theme.text.secondary, fontWeight: '500' }}>
                      {materia.docente}
                    </Text>
                  </View>
                )}
              </View>

              {/* Botones de Acción Táctiles iPadOS (44px min touch target) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                {/* 1. Ver Detalle */}
                <Pressable
                  onPress={() => setSelectedMateriaDetail(materia)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flex: 1,
                    minHeight: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 6,
                  })}
                >
                  <Sparkles size={14} color={IOS_COLORS.cyan} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.primary }}>
                    Ver Detalle
                  </Text>
                </Pressable>

                {/* 2. Ir a Calendario */}
                <Pressable
                  onPress={() => setActiveModule('calendar')}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    minHeight: 44,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 6,
                  })}
                >
                  <Calendar size={14} color={IOS_COLORS.orange} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.primary }}>
                    Calendario
                  </Text>
                </Pressable>

                {/* 3. Botón Táctil de Asistencia (Pill Grande) */}
                <Pressable
                  onPress={() => onToggleAttendance(idx)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.85 : 1,
                    flex: 1.2,
                    minHeight: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isAttended
                      ? isDark
                        ? 'rgba(52, 199, 89, 0.25)'
                        : '#ECFDF5'
                      : isDark
                      ? '#1C1C1E'
                      : '#FFFFFF',
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: isAttended ? IOS_COLORS.green : theme.border,
                    gap: 6,
                  })}
                >
                  <CheckCircle2
                    size={16}
                    color={isAttended ? IOS_COLORS.green : theme.text.tertiary}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: isAttended ? IOS_COLORS.green : theme.text.secondary,
                    }}
                  >
                    {isAttended ? 'Presente ✓' : 'Marcar Asistencia'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* Modal Detalle de Materia */}
      <Modal visible={Boolean(selectedMateriaDetail)} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: 440,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                Detalle de Cursada
              </Text>
              <Pressable onPress={() => setSelectedMateriaDetail(null)} style={{ padding: 4 }}>
                <X size={20} color={theme.text.secondary} />
              </Pressable>
            </View>

            {selectedMateriaDetail && (
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 12, color: theme.text.secondary }}>Materia</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
                    {selectedMateriaDetail.nombre}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 20 }}>
                  <View>
                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>Horario</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                      {selectedMateriaDetail.horaInicio} - {selectedMateriaDetail.horaFin} hs
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>Aula</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                      {selectedMateriaDetail.aula}
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>Curso</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                      {selectedMateriaDetail.curso}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 12, color: theme.text.secondary }}>Docente a cargo</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                    {selectedMateriaDetail.docente}
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 12, color: theme.text.secondary }}>Modalidad</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                    {selectedMateriaDetail.modality}
                  </Text>
                </View>
              </View>
            )}

            <Pressable
              onPress={() => setSelectedMateriaDetail(null)}
              style={{
                backgroundColor: IOS_COLORS.blue,
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
