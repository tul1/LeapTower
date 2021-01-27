# LeapTower
LeapTower is an experimental videogame displayed on the event “Game On – El arte en juego” that took place in Novenmber 2015, at Centro Cultural San Martín (Buenos Aires) [1](http://fedemarino.com.ar/projects/leap-tower/).
Currently the project is been adapted to newer technologies like TypeScript and latest versions of Threejs.

## Install dependencies for LeapTower
To run LeapTower you'll need NodeJS, the TypeScript compiler (tsc) and the project dependencies.
Installing NodeJS:
```bash
sudo snap install node --classic
```
Installing TS globally:
```bash
npm install typescript -g
```
Finally installing project dependencies:
```bash
npm install --all
```

## Run LeapTower locally
Running LeapTower is really easy-piecy, you'll just have to run this:
```bash
npm run dev
```
With this command you'll be launching `nodemon` running a service over `localhost:3000`, and the TS compiler in watch mode looking after `/src/client` and `/src/client` directories. So, every change you'll do in this directories are going to be reflected into the `localhost:3000` for the client side and into your console from the server side.
