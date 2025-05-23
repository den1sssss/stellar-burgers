import { FC } from 'react';

import { Button, Input } from '@zlden/react-developer-burger-ui-components';
import styles from './profile.module.css';
import commonStyles from '../common.module.css';

import { ProfileUIProps } from './type';
import { ProfileMenu } from '@components';

export const ProfileUI: FC<ProfileUIProps> = ({
  formValue,
  isFormChanged,
  updateUserError,
  handleSubmit,
  handleCancel,
  handleInputChange
}) => (
  <main className={`${commonStyles.container}`}>
    <div className={`mt-30 mr-15 ${styles.menu}`}>
      <ProfileMenu />
    </div>
    <form
      className={`mt-30 ${styles.form} ${commonStyles.form}`}
      onSubmit={handleSubmit}
    >
      <>
        <div className='pb-6'>
          <Input
            type='text'
            placeholder='Имя'
            onChange={handleInputChange}
            value={formValue.name}
            name='name'
            error={false}
            errorText=''
            size='default'
            icon='EditIcon'
            onIconClick={() => {}}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          />
        </div>
        <div className='pb-6'>
          <Input
            type='email'
            placeholder='E-mail'
            onChange={handleInputChange}
            value={formValue.email}
            name='email'
            error={false}
            errorText=''
            size='default'
            icon='EditIcon'
            onIconClick={() => {}}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          />
        </div>
        <div className='pb-6'>
          <Input
            type='password'
            placeholder='Пароль'
            onChange={handleInputChange}
            value={formValue.password}
            name='password'
            error={false}
            errorText=''
            size='default'
            icon='EditIcon'
            onIconClick={() => {}}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          />
        </div>
        {isFormChanged && (
          <div className={styles.buttons}>
            <Button
              type='secondary'
              size='medium'
              htmlType='button'
              onClick={handleCancel}
            >
              Отмена
            </Button>
            <Button type='primary' size='medium' htmlType='submit'>
              Сохранить
            </Button>
          </div>
        )}
        {updateUserError && (
          <p className={`${styles.error} text text_type_main-default pt-6`}>
            {updateUserError}
          </p>
        )}
      </>
    </form>
  </main>
);
