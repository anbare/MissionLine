﻿/*
 * Copyright 2015 Matthew Cosand
 */
namespace Kcesar.MissionLine.Website
{
  using System;
  using System.IO;
  using System.Linq;
  using System.Threading.Tasks;
  using System.Xml.Linq;

  internal class TestMemberSource : IMemberSource
  {
    private readonly string filename;

    public TestMemberSource(string filename)
    {
      var thisDll = new Uri(this.GetType().Assembly.CodeBase).LocalPath;
      this.filename = Path.Combine(Path.GetDirectoryName(thisDll), "..", filename);
    }

    private XDocument ReadData()
    {      
      return XDocument.Load(this.filename);
    }

    public Task<MemberLookupResult> LookupMemberPhone(string phone)
    {
      var node = ReadData().Descendants("Phone").FirstOrDefault(f => f.Value == phone);
      return MakeLookupResult(node == null ? null : node.Parent);
    }

    public Task<MemberLookupResult> LookupMemberDEM(string workerNumber)
    {
      return MakeLookupResult(ReadData().Descendants("Member").FirstOrDefault(f => f.Attribute("dem").Value == workerNumber));
    }

    private static Task<MemberLookupResult> MakeLookupResult(XElement element)
    {
      var t = Task.FromResult<MemberLookupResult>(element == null ? null : new MemberLookupResult
      {
        Id = element.Attribute("id").Value,
        Name = element.Attribute("name").Value
      });
      return t;
    }

    public Task<MemberLookupResult> LookupMemberUsername(string username)
    {
      return MakeLookupResult(ReadData().Descendants("Member").FirstOrDefault(f => f.Attribute("username").Value == username));
    }
  }
}
