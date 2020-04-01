import test from 'ava';
import {JsonIgnoreType} from '../src/annotations/JsonIgnoreType';
import {JsonClass} from '../src/annotations/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';

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

@JsonIgnoreType()
class Item {
  id: number;
  name: string;
  category: string;
  owner: User;

  constructor(id: number, name: string, category: string, owner: User) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.owner = owner;
  }
}

test('@JsonIgnoreType serialize', t => {
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Game Of Thrones', 'Book', user);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[null,null]}');
});

test('@JsonIgnoreType deserialize', t => {
  // eslint-disable-next-line max-len
  const jsonData = '{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}]}';
  const objectMapper = new ObjectMapper();

  const user = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(user instanceof User);
  t.is(user.id, 1);
  t.is(user.email, 'john.alfa@gmail.com');
  t.is(user.firstname, 'John');
  t.is(user.lastname, 'Alfa');
  t.deepEqual(user.items, [null, null]);
});

