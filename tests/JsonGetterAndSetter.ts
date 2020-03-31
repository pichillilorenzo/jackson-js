import test from 'ava';
import {JsonGetter, JsonSetter, ObjectMapper} from '../src';

class User {
  id: number;
  firstname: string;
  lastname: string;
  fullname: string[];

  constructor(id: number, firstname: string, lastname: string) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
  }

  @JsonGetter({value: 'fullname'})
  getFullname(): string {
    return this.firstname + ' ' + this.lastname;
  }

  @JsonSetter({value: 'fullname'})
  setFullname(fullname: string): string[] {
    return fullname.split(' ');
  }
}

test('@JsonGetter and @JsonSetter', t => {
  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.fullname instanceof Array);
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});
