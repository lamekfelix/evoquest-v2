'use client';

import { Text, Button, Badge, makeStyles, tokens } from '@fluentui/react-components';
import { DeleteRegular, EditRegular, ReOrderDotsVerticalRegular } from '@fluentui/react-icons';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '@/store/types';

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo',        label: 'A Fazer',      color: '#9B8EA8' },
  { key: 'in_progress', label: 'Em Progresso', color: '#F4A261' },
  { key: 'done',        label: 'Concluído',    color: '#55B96B' },
];

const useStyles = makeStyles({
  board: {
    display: 'flex', gap: '12px', overflowX: 'auto',
    paddingBottom: '8px', alignItems: 'flex-start',
  },
  column: {
    minWidth: '220px', flex: '0 0 220px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  colHeader: {
    padding: '8px 12px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  dropZone: {
    minHeight: '60px', borderRadius: '8px',
    padding: '4px',
    display: 'flex', flexDirection: 'column',
    transition: 'background 0.15s, border-color 0.15s',
  },
  card: {
    padding: '10px 12px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-start',
    userSelect: 'none',
    marginBottom: '8px',
  },
  cardBody: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    flex: 1, minWidth: 0,
  },
  cardActions: { display: 'flex', gap: '2px', justifyContent: 'flex-end' },
  gripHandle: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
    padding: '2px 0',
    borderRadius: '4px',
    flexShrink: 0,
    marginTop: '2px',
    ':hover': {
      color: tokens.colorNeutralForeground1,
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
});

interface Props {
  tasks: Task[];
  attrColor: string;
  onMove: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

export function TaskKanban({ tasks, attrColor, onMove, onDelete, onEdit }: Props) {
  const styles = useStyles();

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    onMove(draggableId, destination.droppableId as TaskStatus);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.board}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className={styles.column}>
              <div className={styles.colHeader} style={{ background: `${col.color}20` }}>
                <Text size={200} weight="semibold" style={{ color: col.color }}>{col.label}</Text>
                <Badge appearance="filled" size="small" style={{ background: col.color, color: '#fff' }}>
                  {colTasks.length}
                </Badge>
              </div>

              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={styles.dropZone}
                    style={{
                      background: snapshot.isDraggingOver ? `${col.color}20` : 'transparent',
                      border: snapshot.isDraggingOver
                        ? `2px dashed ${col.color}`
                        : '2px solid transparent',
                    }}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={styles.card}
                            style={{
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging
                                ? '0 8px 24px rgba(0,0,0,0.25)'
                                : undefined,
                            }}
                          >
                            {/* Drag handle: only this element triggers DnD */}
                            <div
                              {...provided.dragHandleProps}
                              className={styles.gripHandle}
                              style={{ cursor: snapshot.isDragging ? 'grabbing' : 'grab' }}
                            >
                              <ReOrderDotsVerticalRegular style={{ fontSize: '16px' }} />
                            </div>

                            <div className={styles.cardBody}>
                              <Text size={200} weight="semibold">{task.title}</Text>
                              {task.description && (
                                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }} truncate>
                                  {task.description}
                                </Text>
                              )}
                              {(task.startDate || task.endDate) && (
                                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                  {task.startDate ?? ''}
                                  {task.startDate && task.endDate ? ' → ' : ''}
                                  {task.endDate ?? ''}
                                </Text>
                              )}
                              <div className={styles.cardActions}>
                                {onEdit && (
                                  <Button
                                    appearance="subtle" size="small" icon={<EditRegular />}
                                    onClick={() => onEdit(task)} title="Editar"
                                  />
                                )}
                                <Button
                                  appearance="subtle" size="small" icon={<DeleteRegular />}
                                  onClick={() => onDelete(task.id)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
