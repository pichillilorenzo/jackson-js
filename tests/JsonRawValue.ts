import test from 'ava';
import {ObjectMapper, JsonRawValue} from '../src';

class User {
  id: number;
  email: string;
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
