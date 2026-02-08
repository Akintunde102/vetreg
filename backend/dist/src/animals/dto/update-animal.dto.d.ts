import { CreateAnimalDto } from './create-animal.dto';
declare const UpdateAnimalDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAnimalDto>>;
export declare class UpdateAnimalDto extends UpdateAnimalDto_base {
    clientId?: string;
    isActive?: boolean;
}
export {};
