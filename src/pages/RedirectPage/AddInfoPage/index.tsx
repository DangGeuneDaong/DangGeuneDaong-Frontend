import { useForm, Controller } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRandom } from '../../../hooks/useRandom';

import MainTemplate from '../../../components/template/MainTemplate';
import Input from '../../../components/Form/Input';
import Loader from '../../../components/Loader';
import SearchLocation from '../../../components/SearchLocation';

import * as S from './styles';

export interface AddInfoProps {
  nickName: string;
  location: string;
  profile_url: string;
}

function AddInfoPage() {
  const { getSocialUserProfile } = useAuth();
  const { loginType, generateRandomNicknameK, generateRandomNicknameN } =
    useRandom();
  const initialNickname =
    loginType === 'K' ? generateRandomNicknameK() : generateRandomNicknameN();
  const [nicknameEdited, setNicknameEdited] = useState<boolean>(false);
  const [randomNickname, setRandomNickname] = useState<string>(initialNickname);
  const [userProfile, setUserProfile] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { handleInfoSubmit, isLoading, error, alertMessage, showModal } =
    useAuth();
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    setError,
    setValue,
    trigger,
    watch,
  } = useForm<AddInfoProps>({
    mode: 'onBlur',
    defaultValues: {
      nickName: initialNickname,
      location: '',
    },
  });
  const watchProfileUrl = watch('profile_url');
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      getSocialUserProfile(accessToken)
        .then((socialUserData) => {
          setUserProfile(socialUserData.profile_url);
          setValue('profile_url', socialUserData.profile_url);
        })
        .catch((error) => console.error(error));
    }
  }, [setValue]);

  //프로필 사진 미리보기
  const onPreviewImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    const file = e.target.files?.[0];
    if (file) {
      //file => URL
      const url = URL.createObjectURL(file);
      setValue('profile_url', url);

      // 읽기 동작이 성공적으로 완료 되었을 시 실행
      reader.onload = () => {
        if (reader.result) {
        }
      };
    }
  };
  //랜덤 닉네임
  const handleRefreshNickname = async () => {
    if (!nicknameEdited) {
      const newRandomNickname =
        loginType === 'K'
          ? generateRandomNicknameK()
          : generateRandomNicknameN();
      setRandomNickname(newRandomNickname);
      setValue('nickName', newRandomNickname);
      setError('nickName', { message: '' });
    }
  };
  const handleUploadImg = () => {
    fileInput.current?.click();
  };
  const resetImg = () => {
    fileInput.current?.value && (fileInput.current.value = '');
  };
  return (
    <MainTemplate>
      <S.Container>
        <S.SubContainer>
          <S.H1>추가 정보 입력</S.H1>
          <S.Form
            onSubmit={handleSubmit((data) =>
              handleInfoSubmit(data, watchProfileUrl)
            )}
          >
            <S.ProfileImg src={watchProfileUrl} />
            {watchProfileUrl !== userProfile ? (
              <S.CancelButton onClick={resetImg}>
                프로필 이미지 변경 취소
              </S.CancelButton>
            ) : (
              <S.AddSpan onClick={handleUploadImg}>
                프로필 이미지 변경
              </S.AddSpan>
            )}

            <S.ImgInput
              ref={fileInput}
              type="file"
              onChange={(e) => onPreviewImg(e)}
            />
            <S.NicknameContainer>
              <Controller
                control={control}
                name="nickName"
                defaultValue=""
                rules={{ required: '닉네임은 필수 입력입니다.' }}
                render={({ field }) => (
                  <Input
                    label="닉네임"
                    placeholder={randomNickname}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setNicknameEdited(true);
                    }}
                    readOnly={false}
                    errors={errors}
                  />
                )}
              />
              <S.RefreshButton onClick={handleRefreshNickname}>
                🔁
              </S.RefreshButton>
            </S.NicknameContainer>
            <S.NicknameContainer>
              <Controller
                control={control}
                name="location"
                defaultValue=""
                rules={{ required: '주소를 입력해주세요.' }}
                render={({ field }) => (
                  <Input
                    label="주소정보 입력"
                    placeholder="주소 입력"
                    {...field}
                    readOnly
                  />
                )}
              />
              <SearchLocation setValue={setValue} trigger={trigger} />
            </S.NicknameContainer>
            {isValid ? (
              <S.ActiveSaveButton disabled={isLoading}>
                {isLoading ? <Loader /> : '저장하기'}
              </S.ActiveSaveButton>
            ) : (
              <S.InactiveSaveButton disabled>저장하기</S.InactiveSaveButton>
            )}
          </S.Form>
        </S.SubContainer>
      </S.Container>
    </MainTemplate>
  );
}

export default AddInfoPage;
