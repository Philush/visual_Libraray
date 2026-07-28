'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, changePassword } from '@/lib/api/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameLoading(true);
    try {
      const updated = await updateProfile(name.trim());
      updateUser(updated);
      toast.success('Имя обновлено');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка при обновлении имени');
    } finally {
      setNameLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка при смене пароля';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Профиль" className="sm:max-w-sm">
      <div className="flex flex-col gap-6">
        {/* Email (только чтение) */}
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">Email: </span>
          {user?.email}
        </div>

        {/* Смена имени */}
        <form onSubmit={handleSaveName} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-800">Отображаемое имя</h3>
          <Input
            label="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            maxLength={100}
          />
          <Button type="submit" isLoading={nameLoading} size="sm" className="self-end">
            Сохранить
          </Button>
        </form>

        <hr className="border-gray-100" />

        {/* Смена пароля */}
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-800">Смена пароля</h3>
          <Input
            label="Текущий пароль"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Input
            label="Повторите новый пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            error={passwordError || undefined}
            autoComplete="new-password"
          />
          <Button type="submit" isLoading={passwordLoading} size="sm" className="self-end">
            Изменить пароль
          </Button>
        </form>
      </div>
    </Modal>
  );
}
