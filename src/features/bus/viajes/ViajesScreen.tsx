import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { Sparkles, SlidersHorizontal } from 'lucide-react-native';
import { useTodaySchedule } from '../hooks/useTodaySchedule';
import { ViajesHeader } from './ViajesHeader';
import { HorarioCardViaje } from './HorarioCardViaje';
import { ModoViajeEntertainment } from './ModoViajeEntertainment';
import { ClassTimelineTablet } from './ClassTimelineTablet';
import { AllSchedulesModal } from './AllSchedulesModal';
import { IOS_COLORS } from '../../../styles/theme';
import { useAppStore } from '../../../store/useAppStore';

export const ViajesScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    diaSeleccionado,
    setDiaSeleccionado,
    cursaArquitectura,
    setCursaArquitectura,
    duermeEnCordoba,
    setDuermeEnCordoba,
    materiasDelDia,
    isToday,
    horaActualHHMM,
    linePosition,
    activeIndex,
    recomendacionIda,
    recomendacionVuelta,
    overrideIda,
    setOverrideIda,
    overrideVuelta,
    setOverrideVuelta,
    becIda,
    becVuelta,
    toggleBec,
    attendedClasses,
    toggleAttendance,
  } = useTodaySchedule();

  const [isAllSchedulesModalOpen, setIsAllSchedulesModalOpen] = useState(false);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      {/* 1. Header General con Selector de Días y Reloj */}
      <ViajesHeader
        diaSeleccionado={diaSeleccionado}
        setDiaSeleccionado={setDiaSeleccionado}
        isToday={isToday}
        horaActualHHMM={horaActualHHMM}
        onOpenAllSchedules={() => setIsAllSchedulesModalOpen(true)}
        isDark={isDark}
      />

      {/* 2. Controles Contextuales (Martes / Viernes) - Botones Táctiles Interactivos */}
      {(diaSeleccionado === 'martes' || diaSeleccionado === 'viernes') && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {diaSeleccionado === 'martes' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                  ¿Cursás Arquitectura hoy?
                </Text>
                <Text style={{ fontSize: 12, color: theme.text.secondary, marginTop: 2 }}>
                  Ajusta el colectivo de salida a las 06:30 (mañana) o a la tarde
                </Text>
              </View>

              <Pressable
                onPress={() => setCursaArquitectura(!cursaArquitectura)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  minHeight: 44,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: cursaArquitectura ? IOS_COLORS.blue : (isDark ? '#2C2C2E' : '#E5E5EA'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                })}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: cursaArquitectura ? '#FFFFFF' : theme.text.tertiary,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '900',
                    color: cursaArquitectura ? '#FFFFFF' : theme.text.secondary,
                  }}
                >
                  {cursaArquitectura ? 'Sí, curso' : 'No curso'}
                </Text>
              </Pressable>
            </View>
          )}

          {diaSeleccionado === 'viernes' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                  ¿Dormís en Córdoba hoy?
                </Text>
                <Text style={{ fontSize: 12, color: theme.text.secondary, marginTop: 2 }}>
                  Oculta la recomendación de vuelta hacia Despeñaderos
                </Text>
              </View>

              <Pressable
                onPress={() => setDuermeEnCordoba(!duermeEnCordoba)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  minHeight: 44,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: duermeEnCordoba ? IOS_COLORS.purple : (isDark ? '#2C2C2E' : '#E5E5EA'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                })}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: duermeEnCordoba ? '#FFFFFF' : theme.text.tertiary,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '900',
                    color: duermeEnCordoba ? '#FFFFFF' : theme.text.secondary,
                  }}
                >
                  {duermeEnCordoba ? 'Sí, duermo allá' : 'Vuelvo hoy'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* 3. Grid Tablet Dividido en 2 Columnas (Layout Optimizado) */}
      <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-start' }}>
        {/* COLUMNA IZQUIERDA: Viajes de Ida / Vuelta + Modo Viaje */}
        <View style={{ flex: 1, gap: 16 }}>
          {/* Card 1: Ida hacia Córdoba */}
          <HorarioCardViaje
            titulo="Ida hacia Córdoba"
            recomendacion={recomendacionIda}
            direction="ida"
            becUsado={becIda}
            onToggleBec={() => toggleBec('ida')}
            onSelectAlternative={(alt) => setOverrideIda(alt)}
            onResetAutomatic={() => setOverrideIda(null)}
            isManualOverride={Boolean(overrideIda)}
            horaActualHHMM={horaActualHHMM}
            isDark={isDark}
          />

          {/* Modo Viaje 🎧 (Playlists de Spotify) */}
          <ModoViajeEntertainment isDark={isDark} />

          {/* Card 2: Vuelta a Despeñaderos */}
          <HorarioCardViaje
            titulo="Vuelta a Despeñaderos"
            recomendacion={recomendacionVuelta}
            direction="vuelta"
            becUsado={becVuelta}
            onToggleBec={() => toggleBec('vuelta')}
            onSelectAlternative={(alt) => setOverrideVuelta(alt)}
            onResetAutomatic={() => setOverrideVuelta(null)}
            isManualOverride={Boolean(overrideVuelta)}
            horaActualHHMM={horaActualHHMM}
            isDark={isDark}
          />
        </View>

        {/* COLUMNA DERECHA: Cursado / Horario del Día */}
        <View style={{ flex: 1, gap: 16 }}>
          <ClassTimelineTablet
            materiasDelDia={materiasDelDia}
            isToday={isToday}
            horaActualHHMM={horaActualHHMM}
            linePosition={linePosition}
            activeIndex={activeIndex}
            attendedClasses={attendedClasses}
            onToggleAttendance={toggleAttendance}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Modal de Grilla Completa de Horarios */}
      <AllSchedulesModal
        visible={isAllSchedulesModalOpen}
        onClose={() => setIsAllSchedulesModalOpen(false)}
        diaSeleccionado={diaSeleccionado}
        onSelectDay={setDiaSeleccionado}
        onSelectSchedule={(entry, sentido) => {
          if (sentido === 'ida') {
            setOverrideIda(entry);
          } else {
            setOverrideVuelta(entry);
          }
          setIsAllSchedulesModalOpen(false);
        }}
        activeIdaEntry={overrideIda || recomendacionIda?.recomendado || null}
        activeVueltaEntry={overrideVuelta || recomendacionVuelta?.recomendado || null}
        horaActualHHMM={horaActualHHMM}
        isToday={isToday}
        isDark={isDark}
      />
    </ScrollView>
  );
};
