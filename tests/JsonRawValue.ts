import test from 'ava';
import {JsonRawValue} from '../src/annotations/JsonRawValue';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/annotations/JsonProperty';

class User {
  @JsonProperty()
  id: number;
  @JsonProperty()
  email: string;
  @JsonProperty()
  @JsonRawValue()
  otherInfo: string;

  constructor(id: number, email: string, otherInfo: string) {
    this.id = id;
    this.email = email;
    this.otherInfo = otherInfo;
  }
}

test('@JsonRawValue', t => {
  const user = new User(1, 'john.alfa@gmail.com', '{"other": "info 1", "another": "info 2"}');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"email":"john.alfa@gmail.com","otherInfo":{"other":"info 1","another":"info 2"}}');
});
