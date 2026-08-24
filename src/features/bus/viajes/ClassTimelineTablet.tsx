import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import {
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  Sparkles,
  Info,
  User,
  X,
  GraduationCap,
} from 'lucide-react-native';
import { ClassItem } from '../hooks/useTodaySchedule';
import { IOS_COLORS } from '../../../styles/theme';
import { useAppStore } from '../../../store/useAppStore';
import { useNotesStore } from '../../../store/useNotesStore';

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
  linePosition,
  activeIndex,
  attendedClasses,
  onToggleAttendance,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();
  const { setSelectedFolder } = useNotesStore();

  const [selectedMateriaDetail, setSelectedMateriaDetail] = useState<ClassItem | null>(null);

  const handleOpenNotes = () => {
    setSelectedFolder('Estudios');
    setActiveModule('notes');
  };

  if (materiasDelDia.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 24,
          padding: 30,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.border,
          gap: 10,
        }}
      >
        <GraduationCap size={32} color={theme.text.tertiary} />
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
          Sin materias programadas para hoy 🏠
        </Text>
        <Text style={{ fontSize: 12, color: theme.text.secondary }}>
          Día libre de cursado académico en la facultad.
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        gap: 16,
      }}
    >
      {/* Header del Cursado */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color={IOS_COLORS.purple} />
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
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
            {materiasDelDia.length} {materiasDelDia.length === 1 ? 'materia' : 'materias'}
          </Text>
        </View>
      </View>

      {/* Timeline Vertical de Materias */}
      <View style={{ gap: 16 }}>
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
                borderColor: theme.border,
                gap: 12,
              }}
            >
              {/* Top Row: Nombre de materia + Badge Curso */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: theme.text.primary, lineHeight: 20 }}>
                    {materia.nombre}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginTop: 4 }}>
                    {materia.horaInicio} - {materia.horaFin} hs
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
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

              {/* Status en Vivo (En curso ahora / Próxima) */}
              {isCurrentClass && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(52, 199, 89, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                    gap: 6,
                  }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' }} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#34C759' }}>
                    En curso ahora
                  </Text>
                </View>
              )}

              {/* Info: Aula y Docente */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} color={theme.text.tertiary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                    Aula: {materia.aula}
                  </Text>
                </View>

                {materia.docente && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <User size={13} color={theme.text.tertiary} />
                    <Text style={{ fontSize: 12, color: theme.text.secondary, fontWeight: '500' }}>
                      {materia.docente}
                    </Text>
                  </View>
                )}
              </View>

              {/* Botones de Acción: Ver Detalle, Notas, Asistencia */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                {/* 1. Ver Detalle */}
                <Pressable
                  onPress={() => setSelectedMateriaDetail(materia)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 4,
                  })}
                >
                  <Sparkles size={12} color={IOS_COLORS.cyan} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.primary }}>
                    Ver Detalle
                  </Text>
                </Pressable>

                {/* 2. Notas */}
                <Pressable
                  onPress={handleOpenNotes}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 4,
                  })}
                >
                  <FileText size={12} color={IOS_COLORS.orange} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.primary }}>
                    Notas
                  </Text>
                </Pressable>

                {/* 3. Asistencia */}
                <Pressable
                  onPress={() => onToggleAttendance(idx)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isAttended
                      ? isDark
                        ? 'rgba(52, 199, 89, 0.2)'
                        : '#ECFDF5'
                      : isDark
                      ? '#1C1C1E'
                      : '#FFFFFF',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isAttended ? IOS_COLORS.green : theme.border,
                    gap: 4,
                  })}
                >
                  <CheckCircle2
                    size={13}
                    color={isAttended ? IOS_COLORS.green : theme.text.tertiary}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: isAttended ? IOS_COLORS.green : theme.text.secondary,
                    }}
                  >
                    {isAttended ? 'Presente' : 'Asistencia'}
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
              borderRadius: 20,
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
              <Pressable onPress={() => setSelectedMateriaDetail(null)}>
                <X size={20} color={theme.text.secondary} />
              </Pressable>
            </View>

            {selectedMateriaDetail && (
              <View style={{ gap: 10 }}>
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
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
