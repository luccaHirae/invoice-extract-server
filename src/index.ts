import createApp from './server';
import prisma from './lib/prisma';

const app = createApp(prisma);
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
export default app;
