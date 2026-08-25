/**
 * MasterListView.tsx
 * Vista Master de Listas para Reminders en iPadOS.
 *
 * Características:
 * 1. Toque simple (Short Press): Abre/cierra hacia abajo (acordeón inline) las tareas de esa lista.
 * 2. Toque sostenido (Long Press): Abre la lista a pantalla completa (vista dedicada con secciones y tablero).
 * 3. Tareas inline con Checkbox interactivo, fecha y flag.
 * 4. Botón rápido para crear tarea o ver lista completa.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Hash,
  Tag,
  Flag,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TaskList, TaskItem } from '../../../types';
import { ListIconRenderer } from '../../../components/ui/ListIconRenderer';
import { ReminderCheckbox } from './ReminderCheckbox';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface MasterListViewProps {
  lists: TaskList[];
  tasks: TaskItem[];
  onSelectList: (listId: string) => void;
  onOpenNewList: () => void;
  onSelectTag?: (tag: string) => void;
  onToggleTaskComplete?: (taskId: string) => void;
  onPressTask?: (task: TaskItem) => void;
  onLongPressTask?: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleTaskFlag?: (taskId: string) => void;
  onAddQuickTaskInList?: (listId: string) => void;
  isDark?: boolean;
}

export const MasterListView: React.FC<MasterListViewProps> = ({
  lists,
  tasks,
  onSelectList,
  onOpenNewList,
  onSelectTag,
  onToggleTaskComplete,
  onPressTask,
  onLongPressTask,
  onDeleteTask,
  onToggleTaskFlag,
  onAddQuickTaskInList,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  // Estado de listas desplegadas inline (acordeón)
  const [expandedListIds, setExpandedListIds] = useState<string[]>([]);
  const [activeTaskActionId, setActiveTaskActionId] = useState<string | null>(null);

  // Toggle acordeón con háptica
  const handleToggleAccordion = (listId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setExpandedListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  // Long press para entrar a pantalla completa
  const handleLongPressList = (listId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSelectList(listId);
  };

  // Extraer todas las etiquetas únicas con sus conteos
  const tagsMap: Record<string, number> = {};
  tasks.forEach((t) => {
    if (!t.is_completed && t.tags) {
      t.tags.forEach((tag) => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    }
  });

  const uniqueTags = Object.keys(tagsMap);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30, gap: 20 }}
    >
      {/* 1. Sección: Mis Listas */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Mis Listas
          </Text>
          <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
            Toca para desplegar • Mantén presionado para pantalla completa
          </Text>
        </View>

        <View
          style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
            overflow: 'hidden',
            ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.03, 6),
          }}
        >
          {lists.map((list, index) => {
            const listTasks = tasks.filter((t) => t.list_id === list.id && !t.is_completed);
            const count = listTasks.length;
            const isLast = index === lists.length - 1;
            const isExpanded = expandedListIds.includes(list.id);

            return (
              <View
                key={list.id}
                style={{
                  borderBottomWidth: isLast && !isExpanded ? 0 : 1,
                  borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
                }}
              >
                {/* Cabecera de la lista */}
                <Pressable
                  onPress={() => handleToggleAccordion(list.id)}
                  onLongPress={() => handleLongPressList(list.id)}
                  delayLongPress={350}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: isExpanded
                      ? isDark
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,122,255,0.03)'
                      : 'transparent',
                  })}
                >
                  {/* Left: Icono Circular + Título */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: list.color || IOS_COLORS.blue,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ListIconRenderer icon={list.icon} size={16} color="#FFFFFF" />
                    </View>

                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: IOS_FONTS.bold,
                        color: theme.text.primary,
                      }}
                    >
                      {list.title}
                    </Text>
                  </View>

                  {/* Right: Contador + Chevron rotativo */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: isExpanded ? `${list.color || '#007AFF'}25` : (isDark ? '#2C2C2E' : '#F2F2F7'),
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: IOS_FONTS.bold,
                          color: isExpanded ? (list.color || '#007AFF') : theme.text.secondary,
                        }}
                      >
                        {count}
                      </Text>
                    </View>

                    {isExpanded ? (
                      <ChevronDown size={18} color={list.color || IOS_COLORS.blue} />
                    ) : (
                      <ChevronRight size={18} color={theme.text.tertiary} />
                    )}
                  </View>
                </Pressable>

                {/* Acordeón Inline: Lista de tareas desplegadas hacia abajo */}
                {isExpanded && (
                  <View
                    style={{
                      backgroundColor: theme.cardSecondary,
                      borderTopWidth: 1,
                      borderTopColor: theme.border,
                    }}
                  >
                    {listTasks.length === 0 ? (
                      <View style={{ paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                          No hay recordatorios pendientes en esta lista
                        </Text>
                      </View>
                    ) : (
                      listTasks.map((task) => {
                        const isActionOpen = activeTaskActionId === task.id;

                        return (
                          <Pressable
                            key={task.id}
                            onPress={() => {
                              if (isActionOpen) {
                                setActiveTaskActionId(null);
                              } else {
                                onPressTask?.(task);
                              }
                            }}
                            onLongPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                              setActiveTaskActionId(task.id);
                            }}
                            delayLongPress={350}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.75 : 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: 10,
                              paddingHorizontal: 16,
                              gap: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: isDark ? '#222224' : '#EFEFF4',
                              position: 'relative',
                              backgroundColor: isActionOpen
                                ? isDark
                                  ? 'rgba(0, 122, 255, 0.08)'
                                  : 'rgba(0, 122, 255, 0.04)'
                                : 'transparent',
                            })}
                          >
                            {/* Checkbox interactivo */}
                            <ReminderCheckbox
                              checked={Boolean(task.is_completed)}
                              onToggle={() => onToggleTaskComplete?.(task.id)}
                              color={list.color || IOS_COLORS.blue}
                              size={20}
                              isDark={isDark}
                            />

                            {/* Título y metadatos */}
                            <View style={{ flex: 1, gap: 2 }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: IOS_FONTS.semibold,
                                  color: task.is_completed ? theme.text.tertiary : theme.text.primary,
                                  textDecorationLine: task.is_completed ? 'line-through' : 'none',
                                }}
                                numberOfLines={1}
                              >
                                {task.title}
                              </Text>

                              {task.due_date && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <Calendar size={11} color={list.color || IOS_COLORS.blue} />
                                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: list.color || IOS_COLORS.blue }}>
                                    {task.due_date} {task.due_time ? `• ${task.due_time}` : ''}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Flag Icon */}
                            {Boolean(task.flagged) && (
                              <Flag size={13} color="#FF9500" fill="#FF9500" />
                            )}

                            {/* Mini Menú de Acciones Compacto en el Borde */}
                            {isActionOpen && (
                              <View
                                style={{
                                  position: 'absolute',
                                  right: 8,
                                  top: 6,
                                  bottom: 6,
                                  zIndex: 60,
                                  backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                                  borderRadius: 12,
                                  borderWidth: 1,
                                  borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingHorizontal: 6,
                                  gap: 4,
                                  ...createShadow('#000000', { width: 0, height: 4 }, 0.25, 8),
                                }}
                              >
                                {/* Botón Editar */}
                                <Pressable
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setActiveTaskActionId(null);
                                    onPressTask?.(task);
                                  }}
                                  style={({ pressed }) => ({
                                    opacity: pressed ? 0.7 : 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4,
                                    paddingHorizontal: 8,
                                    paddingVertical: 5,
                                    borderRadius: 8,
                                    backgroundColor: isDark ? 'rgba(0, 122, 255, 0.2)' : '#EFF6FF',
                                  })}
                                >
                                  <Edit3 size={13} color="#007AFF" />
                                  <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: '#007AFF' }}>
                                    Editar
                                  </Text>
                                </Pressable>

                                {/* Botón Eliminar */}
                                <Pressable
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setActiveTaskActionId(null);
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                                    onDeleteTask?.(task.id);
                                  }}
                                  style={({ pressed }) => ({
                                    opacity: pressed ? 0.7 : 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4,
                                    paddingHorizontal: 8,
                                    paddingVertical: 5,
                                    borderRadius: 8,
                                    backgroundColor: isDark ? 'rgba(255, 59, 48, 0.2)' : '#FEE2E2',
                                  })}
                                >
                                  <Trash2 size={13} color="#FF3B30" />
                                  <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: '#FF3B30' }}>
                                    Eliminar
                                  </Text>
                                </Pressable>

                                {/* Botón Cerrar */}
                                <Pressable
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setActiveTaskActionId(null);
                                  }}
                                  style={({ pressed }) => ({
                                    opacity: pressed ? 0.7 : 1,
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                                  })}
                                >
                                  <X size={12} color={theme.text.secondary} />
                                </Pressable>
                              </View>
                            )}
                          </Pressable>
                        );
                      })
                    )}

                    {/* Barra de acciones de la lista expandida */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      }}
                    >
                      <Pressable
                        onPress={() => onAddQuickTaskInList?.(list.id)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        })}
                      >
                        <Plus size={14} color={list.color || IOS_COLORS.blue} strokeWidth={2.5} />
                        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: list.color || IOS_COLORS.blue }}>
                          Añadir recordatorio
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onSelectList(list.id)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        })}
                      >
                        <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary }}>
                          Abrir pantalla completa
                        </Text>
                        <ChevronRight size={13} color={theme.text.tertiary} />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Botón: + Nueva Lista */}
        <Pressable
          onPress={onOpenNewList}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
            gap: 10,
          })}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: 'rgba(0, 122, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={16} color={IOS_COLORS.blue} strokeWidth={2.5} />
          </View>
          <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: IOS_COLORS.blue }}>
            Nueva Lista
          </Text>
        </Pressable>
      </View>

      {/* 2. Sección: Etiquetas (#Tags) */}
      {uniqueTags.length > 0 && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
            <Tag size={13} color={theme.text.secondary} />
            <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Etiquetas
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {uniqueTags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => onSelectTag?.(tag)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  gap: 6,
                })}
              >
                <Hash size={13} color={IOS_COLORS.cyan} />
                <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  {tag}
                </Text>
                <View
                  style={{
                    backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: theme.text.secondary }}>
                    {tagsMap[tag]}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};
