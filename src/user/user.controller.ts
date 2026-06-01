import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { storage } from './oss';
import * as path from 'path';
import * as fs from 'fs';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('merge/file')
  mergeFile(@Query('file') fileName: string, @Res() res: Response) {
    const nameDir = 'uploads/chunks-' + fileName;
    // Tạo thư mục 'uploads/merge' nếu chưa có để tránh lỗi ghi file
    if (!fs.existsSync('uploads/merge')) {
      fs.mkdirSync('uploads/merge', { recursive: true });
    }

    const files = fs.readdirSync(nameDir); 

    files.sort((a: string, b: string): number => {
      const indexA = parseInt(a.split('-').pop() ?? '0', 10);
      const indexB = parseInt(b.split('-').pop() ?? '0', 10);
      return indexA - indexB;
    });

    let startPos = 0,
      countFile = 0;

    files.map((file, index) => {
      // get path full
      const chunkName = file.match(/(.+)-\d+$/)?.[1];
      const filePath = nameDir + '/' + chunkName + '-' + index;
      const streamFile = fs.createReadStream(filePath);
      streamFile
        .pipe(
          fs.createWriteStream('uploads/merge/' + fileName, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          countFile++;
          if (files.length === countFile) {
            fs.rm(
              nameDir,
              {
                recursive: true,
                force: true,
              },
              () => {},
            );
          }
        });

      startPos += fs.statSync(filePath).size;
    });
    return res.json({
      link: 'http://localhost:3000/uploads/merge/' + fileName,
      fileName,
    });
  }

  @Post('upload/large-file')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadLargeFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { name: string },
  ) {
    console.log('body++++', body);
    //1. get file name
    const fileName = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name; // aasbb -1 -2 aasbb
    const nameDir = 'uploads/chunks-' + fileName;

    //2 mkdir
    if (!fs.existsSync(nameDir)) {
      fs.mkdirSync(nameDir);
    }
    //3.cp
    fs.cpSync(files[0].path, nameDir + '/' + body.name);
    //4. remove
    fs.rmSync(files[0].path);
  }

  @Post('upload/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/avatar',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter(req, file, cb) {
        const extName = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.png', '.gif'].includes(extName)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Upload avatar error'), false);
        }
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return file.path;
  }

  @Post('new')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
