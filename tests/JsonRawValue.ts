import test from 'ava';
import {JsonRawValue} from '../src/decorators/JsonRawValue';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonClassType} from '../src/decorators/JsonClassType';

test('@JsonRawValue at property level', t => {
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    email: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonRawValue()
    otherInfo: string;

    constructor(id: number, email: string, otherInfo: string) {
      this.id = id;
      this.email = email;
      this.otherInfo = otherInfo;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', '{"other": "info 1", "another": "info 2"}');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","otherInfo":{"other":"info 1","another":"info 2"}}'));
});

test('@JsonRawValue at method level', t => {
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    email: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    otherInfo: string;

    constructor(id: number, email: string, otherInfo: string) {
      this.id = id;
      this.email = email;
      this.otherInfo = otherInfo;
    }

    @JsonGetter() @JsonClassType({type: () => [String]})
    @JsonRawValue()
    getOtherInfo(): string {
      return this.otherInfo;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', '{"other": "info 1", "another": "info 2"}');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","otherInfo":{"other":"info 1","another":"info 2"}}'));
});
