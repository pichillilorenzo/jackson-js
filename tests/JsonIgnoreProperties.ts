import test from 'ava';
import {JsonIgnoreProperties, JsonClass, ObjectMapper, JsonGetter, JsonSetter} from '../src';

test('@JsonIgnoreProperties', t => {
  class User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;

    @JsonClass({class: () => [Array, [Item]]})
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  @JsonIgnoreProperties({
    value: ['owner']
  })
  class Item {
    id: number;
    name: string;
    category: string;

    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, category: string, owner: User) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Game Of Thrones', 'Book', user);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.assert(jsonData.includes('john.alfa@gmail.com'));
  t.assert(jsonData.includes('Game Of Thrones'));
  t.assert(jsonData.includes('NVIDIA'));
  t.assert(!jsonData.includes('owner'));
});

test('@JsonIgnoreProperties with @JsonGetter and @JsonSetter', t => {
  @JsonIgnoreProperties({value: ['fullname']})
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

  const user = new User(1, 'Lorenzo', 'Pichilli');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.assert(jsonData.includes('1'));
  t.assert(jsonData.includes('Lorenzo'));
  t.assert(jsonData.includes('Pichilli'));
  t.assert(!jsonData.includes('fullname'));
  t.assert(!jsonData.includes('Lorenzo Pichilli'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'Lorenzo');
  t.is(userParsed.lastname, 'Pichilli');
  t.is(userParsed.fullname, undefined);
});

test('@JsonIgnoreProperties with allowGetters "true"', t => {
  @JsonIgnoreProperties({value: ['fullname', 'firstname'], allowGetters: true})
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

  const user = new User(1, 'Lorenzo', 'Pichilli');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.assert(jsonData.includes('1'));
  t.assert(!jsonData.includes('firstname'));
  t.assert(jsonData.includes('lastname'));
  t.assert(jsonData.includes('fullname'));
  t.assert(jsonData.includes('Lorenzo Pichilli'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Pichilli');
  t.is(userParsed.fullname, undefined);
});

test('@JsonIgnoreProperties with allowSetters "true"', t => {
  @JsonIgnoreProperties({value: ['fullname', 'firstname'], allowGetters: true, allowSetters: true})
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

  const user = new User(1, 'Lorenzo', 'Pichilli');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.assert(jsonData.includes('1'));
  t.assert(!jsonData.includes('firstname'));
  t.assert(jsonData.includes('lastname'));
  t.assert(jsonData.includes('fullname'));
  t.assert(jsonData.includes('Lorenzo Pichilli'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Pichilli');
  t.deepEqual(userParsed.fullname, ['Lorenzo', 'Pichilli']);
});

test('@JsonIgnoreProperties with ignoreUnknown "true"', t => {
  @JsonIgnoreProperties({value: ['firstname'], ignoreUnknown: true})
  class User {
    id: number;
    firstname: string;
    lastname: string;

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"id":1,"firstname":"Lorenzo","lastname":"Pichilli","email":"pichillilorenzo@gmail.com"}';

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Pichilli');
  t.assert(!Object.hasOwnProperty.call(userParsed, 'email'));
});
