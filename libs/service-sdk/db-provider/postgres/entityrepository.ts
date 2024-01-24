import { AuditBaseEntity, ConflictError, NotFoundError } from "@butlerhospitality/service-sdk";
import { EntityRepository, FilterQuery, LockMode, Populate } from "@mikro-orm/core";
import { PureBaseEntity, EmptyBaseEntity } from "./base-entity";

const SoftDelErrorMsg = "deleted_at attr does not exist for the given entity";
export class CustomEntityRepository<T extends PureBaseEntity | EmptyBaseEntity> extends EntityRepository<T> {
  async getOneEntityOrFail(where: FilterQuery<T>, populate?: Populate<T>): Promise<T> {
    const entity = await this.findOne(where, populate);

    if (!entity) {
      throw new NotFoundError(this.entityName.toString());
    }

    return entity;
  }

  async getOneEntityOrFailWithLock(where: FilterQuery<T>, lockVersion: number, populate?: Populate<T>): Promise<T> {
    const lockMode = LockMode.OPTIMISTIC;

    const entity = await this.findOne(where, {
      populate,
      lockMode,
      lockVersion
    });

    if (!entity) {
      throw new NotFoundError(this.entityName.toString());
    }

    return entity;
  }

  async failIfEntityExists(where: FilterQuery<T>): Promise<void> {
    const entityExists = await this.findOne(where);

    if (entityExists) {
      const errorMessage = this.constructErrorMessageForUniqueFields(where);
      throw new ConflictError(`This ${this.entityName.toString().toLowerCase()} already exists. ${errorMessage}`);
    }
  }

  async softDelete(id: number | number[]): Promise<boolean> {
    if (Array.isArray(id)) {
      const entitiesToDelete = await this.getEntitiesOrFailIfNotFound(id);
      for (const entity of entitiesToDelete) {
        if (!(entity instanceof AuditBaseEntity)) {
          throw new Error(SoftDelErrorMsg);
        }
        entity.deleted_at = new Date();
      }

      await this.flush();
    } else {
      const entityToDelete = await this.getOneEntityOrFail({ id } as FilterQuery<T>);
      if (!(entityToDelete instanceof AuditBaseEntity)) {
        throw new Error(SoftDelErrorMsg);
      }
      entityToDelete.deleted_at = new Date();

      await this.flush();
    }

    return true;
  }

  async getEntitiesOrFailIfNotFound(entityIDs: number[], populate?: Populate<T>): Promise<T[]> {
    const uniqueIDs = [...new Set(entityIDs)];
    const foundEntities = await this.find({ id: { $in: uniqueIDs } } as any, populate);

    if (foundEntities.length !== uniqueIDs.length) {
      throw new NotFoundError("Entity", `Some of the ${this.entityName.toString().toLowerCase()}s do not exist in the database`);
    }

    return foundEntities;
  }

  private convertKey(key: string) {
    /* replaceBracketsRegex --> regex to match anything inside brackets including them i.g name[eq] => [eq] */
    const replaceBracketsRegex = /\[[^]*\]/g;
    /* replace the key if regex match i.g name[eq] => name */
    key = key.replace(replaceBracketsRegex, "");

    if (key.includes("id")) {
      /* removeIdPostfixRegex --> regex to match the postfix _id i.g parent_id => _id */
      const removeIdPostfixRegex = /_id.*/;
      /* replace the _id postfix if regex match i.g parent_id => parent */
      key = key.replace(removeIdPostfixRegex, "");
    }
    /* replace _ with a space " " i.g parent_category => parent category */
    return key.replace("_", " ");
  }

  private constructErrorMessageForUniqueFields(where: FilterQuery<T>) {
    let errorMessage = "";
    let combinedFields = true;
    const keys = [];

    Object.keys(where).forEach((key) => {
      if (key.startsWith("$")) {
        if (key == "$or") {
          combinedFields = false;
        }
        if (Array.isArray(where[key])) {
          where[key].forEach((obj) => {
            Object.keys(obj).forEach((nestedKey) => {
              keys.push(this.convertKey(nestedKey));
            });
          });
        } else if (typeof where[key] == "object") {
          Object.keys(where[key]).forEach((nestedKey) => {
            keys.push(this.convertKey(nestedKey));
          });
        }
      } else {
        keys.push(this.convertKey(key));
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    keys.length > 1 ?
      keys.forEach((key, idx) =>
        idx == 0 ?
          (errorMessage += `The ${combinedFields ? "combination of" : "properties"} ${key}`) :
          idx == keys.length - 1 ?
            (errorMessage += `${combinedFields ? ` and ${key} must be unique.` : ` or ${key} are not unique.`}`) :
            (errorMessage += `, ${key}`)
      ) :
      keys.length == 1 ?
        (errorMessage += `${keys[0].charAt(0).toUpperCase() + keys[0].slice(1)} must be unique.`) :
        null;

    return errorMessage;
  }
}
