import test from 'ava';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter} from '../src/decorators/JsonSetter';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

class User {
  @JsonProperty()
  id: number;
  @JsonProperty()
  firstname: string;
  @JsonProperty()
  lastname: string;
  @JsonProperty()
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
  setFullname(fullname: string) {
    this.fullname = fullname.split(' ');
  }
}

test('@JsonGetter and @JsonSetter', t => {
  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.fullname instanceof Array);
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});
