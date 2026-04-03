import { ValidationArguments } from 'class-validator';

export const validationMessage = {
  length: (args: ValidationArguments) => {
    /**
     * value -> 검증되고 있는값 (입력된값)
     * constraints -> 파라미터에 입력된 제한 사항들
     * constraints[0], constraints[1] -> 2, 20
     * property -> 검증되고 있는 프로퍼티 이름 (nickname)
     * targetName -> 검증되고 있는 클래스 이름 (UsersModel)
     * object -> 검증되고 있는 객체 전체 (UsersModel의 인스턴스)
     */
    if (args.constraints.length === 2) {
      return `${args.property}은 ${args.constraints[0]}자 이상 ${args.constraints[1]}자 이하로 입력해주세요.`;
    } else {
      return `${args.property}의 길이가 잘못되었습니다.`;
    }
  },

  string: (args: ValidationArguments) => {
    return `${args.property}은 문자열이어야 합니다.`;
  },

  email: (args: ValidationArguments) => {
    return `${args.property}은 이메일 형식이어야 합니다.`;
  },
};
