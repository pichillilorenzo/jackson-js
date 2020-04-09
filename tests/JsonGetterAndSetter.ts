import test from 'ava';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter} from '../src/decorators/JsonSetter';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonGetter and @JsonSetter', t => {
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

    @JsonGetter()
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonSetter()
    setFullname(fullname: string) {
      this.fullname = fullname.split(' ');
    }
  }

  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.fullname instanceof Array);
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});

test('@JsonGetter and @JsonSetter with value', t => {
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
    getMyFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonSetter({value: 'fullname'})
    setMyFullname(fullname: string) {
      this.fullname = fullname.split(' ');
    }
  }

  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.fullname instanceof Array);
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});
