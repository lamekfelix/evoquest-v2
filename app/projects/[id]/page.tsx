'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Text, Button, Input, Badge, Card,
  makeStyles, tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, ArrowLeftRegular } from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { ATTRIBUTES } from '@/store/constants';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px' },
  todoItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  addRow: { display: 'flex', gap: '8px' },
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const styles = useStyles();
  const router = useRouter();

  const project = useAppStore((s) => s.projects.find((p) => p.id === id));
  const addTodo = useAppStore((s) => s.addTodo);
  const toggleTodo = useAppStore((s) => s.toggleTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);
  const addAttrXp = useAppStore((s) => s.addAttrXp);

  const [todoText, setTodoText] = useState('');

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <Text>Projeto não encontrado.</Text>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/projects')}>
          Voltar
        </Button>
      </div>
    );
  }

  const attr = ATTRIBUTES.find((a) => a.key === project.attribute)!;
  const done = project.todos.filter((t) => t.done).length;

  function handleAddTodo() {
    if (!todoText.trim()) return;
    addTodo(project!.id, todoText.trim());
    setTodoText('');
  }

  function handleToggle(todoId: string) {
    const todo = project!.todos.find((t) => t.id === todoId);
    const wasDone = todo?.done ?? false;
    toggleTodo(project!.id, todoId);
    // +10 XP ao completar uma tarefa
    if (!wasDone) addAttrXp(project!.attribute, 10);
  }

  return (
    <div className={styles.page}>
      {/* Voltar */}
      <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => router.push('/projects')}
        style={{ alignSelf: 'flex-start' }}>
        Voltar a Projetos
      </Button>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Text size={600} weight="bold">{project.name}</Text>
          <Badge
            appearance="filled"
            style={{ background: attr.color, color: '#fff' }}
          >
            {attr.icon} {attr.label}
          </Badge>
        </div>
        {project.description && (
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>{project.description}</Text>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          {project.startDate && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>📅 Início: {project.startDate}</Text>
          )}
          {project.endDate && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>🏁 Fim: {project.endDate}</Text>
          )}
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            ✅ {done}/{project.todos.length} tarefas
          </Text>
        </div>
      </div>

      {/* Progresso */}
      {project.todos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Progresso</Text>
          <div style={{ height: 8, borderRadius: 4, background: tokens.colorNeutralBackground3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${Math.floor((done / project.todos.length) * 100)}%`,
              background: attr.color, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* Adicionar tarefa */}
      <div className={styles.addRow}>
        <Input
          style={{ flex: 1 }}
          placeholder="Nova tarefa..."
          value={todoText}
          onChange={(_, d) => setTodoText(d.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <Button appearance="primary" icon={<AddRegular />} onClick={handleAddTodo} disabled={!todoText.trim()}>
          Adicionar
        </Button>
      </div>

      {/* Lista de tarefas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {project.todos.length === 0 ? (
          <Text size={300} style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', padding: 24 }}>
            Nenhuma tarefa. Adicione a primeira acima!
          </Text>
        ) : (
          project.todos.map((todo) => (
            <div key={todo.id} className={styles.todoItem} style={{ opacity: todo.done ? 0.6 : 1 }}>
              <button
                onClick={() => handleToggle(todo.id)}
                style={{
                  width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${attr.color}`,
                  background: todo.done ? attr.color : 'transparent',
                  cursor: 'pointer',
                }}
              />
              <Text
                size={300}
                style={{
                  flex: 1,
                  textDecoration: todo.done ? 'line-through' : 'none',
                  color: todo.done ? tokens.colorNeutralForeground2 : tokens.colorNeutralForeground1,
                }}
              >
                {todo.text}
              </Text>
              {todo.done && (
                <Text size={100} style={{ color: attr.color }}>+10 XP</Text>
              )}
              <Button
                appearance="subtle"
                size="small"
                icon={<DeleteRegular />}
                onClick={() => deleteTodo(project.id, todo.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
