import test from 'ava';
import {JsonIgnore} from '../src/decorators/JsonIgnore';
import {JsonClass} from '../src/decorators/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

class User {
  @JsonProperty()
  id: number;
  @JsonProperty()
  email: string;
  @JsonProperty()
  firstname: string;
  @JsonProperty()
  lastname: string;

  @JsonProperty()
  @JsonClass({class: () => [Array, [Item]]})
  items: Item[] = [];

  constructor(id: number, email: string, firstname: string, lastname: string) {
    this.id = id;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
  }
}

class Item {
  @JsonProperty()
  id: number;
  @JsonProperty()
  name: string;

  @JsonProperty()
  @JsonIgnore()
  category: string;

  @JsonProperty()
  @JsonIgnore()
  owner: User;

  constructor(id: number, name: string, category: string, owner: User) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.owner = owner;
  }
}

test('@JsonIgnore', t => {
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Game Of Thrones', 'Book', user);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"items":[{"id":1,"name":"Game Of Thrones"},{"id":2,"name":"NVIDIA"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}');
});
